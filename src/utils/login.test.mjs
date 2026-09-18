import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

const loadModule = (filename, imports, window) => {
	const source = readFileSync(new URL(filename, import.meta.url), 'utf8');
	const compiled = ts.transpileModule(source, {
		compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
	}).outputText;
	const context = {
		exports: {},
		window,
		URLSearchParams,
		require: name => {
			assert.ok(name in imports, `unexpected import: ${name}`);
			return imports[name];
		},
	};
	runInNewContext(compiled, context, { filename });
	return context.exports;
};

const setup = (href = 'https://example.test/robot?name=%E6%B5%8B%E8%AF%95#details') => {
	const navigations = [];
	const window = {
		location: {
			pathname: new URL(href).pathname,
			get href() {
				return href;
			},
			set href(value) {
				navigations.push(value);
				href = new URL(value, href).href;
			},
		},
	};
	let response = { code: 401, data: { login_method: 'token' } };
	const login = loadModule(
		'./login.ts',
		{
			'@/api/wechat-robot/wechat-robot': {
				HttpClient: class {},
				WechatRobotClient: class {
					user = { selfList: async () => ({ data: response }) };
				},
			},
			'@/constant/redirect-url': { UrlLogin: '/login' },
		},
		window,
	);
	let interceptor;
	const app = loadModule(
		'./appInit.ts',
		{
			'./login': login,
			'./clientInit': {
				clientInit: options => {
					interceptor = options.respInterceptors[0].onFulfilled;
				},
			},
		},
		window,
	);
	app.Init();
	return {
		login,
		interceptor,
		navigations,
		setResponse: value => {
			response = value;
		},
	};
};

test('login mode follows the server even when the URL contains an old scan mode', async () => {
	const { login, setResponse, navigations } = setup('https://example.test/login?login_method=scan');
	for (const code of [200, 401]) {
		for (const login_method of ['token', 'scan']) {
			setResponse({ code, data: { login_method } });
			assert.equal(await login.loadLoginMethod(), login_method);
		}
	}
	assert.equal(navigations.length, 0);
});

test('missing or invalid login configuration can be retried without falling back to scan', async () => {
	const { login, setResponse, navigations } = setup('https://example.test/login');
	for (const data of [null, {}, { login_method: '' }, { login_method: 'unknown' }]) {
		setResponse({ code: 401, data });
		await assert.rejects(login.loadLoginMethod(), /未获取到有效的登录方式/);
	}
	setResponse({ code: 500, message: '服务暂不可用', data: { login_method: 'scan' } });
	await assert.rejects(login.loadLoginMethod(), /服务暂不可用/);
	setResponse({ code: 401, data: { login_method: 'token' } });
	assert.equal(await login.loadLoginMethod(), 'token');
	assert.equal(navigations.length, 0);
});

test('concurrent 401 responses redirect only once and preserve the original URL', async () => {
	const href = 'https://example.test/robot?name=%E6%B5%8B%E8%AF%95&next=%2Fchat#details';
	const { interceptor, navigations } = setup(href);
	await Promise.all([
		assert.rejects(interceptor({ data: { code: 401, message: '会话已过期', data: null } }), /会话已过期/),
		assert.rejects(
			interceptor({ data: { code: 401, message: '会话已过期', data: { login_method: 'token' } } }),
			/会话已过期/,
		),
	]);
	assert.equal(navigations.length, 1);
	const target = new URL(navigations[0], href);
	assert.equal(target.pathname, '/login');
	assert.equal(target.searchParams.get('login_method'), null);
	assert.equal(target.searchParams.get('redirect'), href);
});

test('known login modes are preserved by the 401 redirect', async () => {
	for (const login_method of ['token', 'scan']) {
		const { interceptor, navigations } = setup();
		await assert.rejects(interceptor({ data: { code: 401, message: 'expired', data: { login_method } } }));
		assert.equal(new URL(navigations[0], 'https://example.test').searchParams.get('login_method'), login_method);
	}
});

test('a 401 on the login page does not cause a redirect loop', async () => {
	const { interceptor, navigations } = setup('https://example.test/login');
	await assert.rejects(interceptor({ data: { code: 401, message: 'expired', data: null } }));
	assert.equal(navigations.length, 0);
});
