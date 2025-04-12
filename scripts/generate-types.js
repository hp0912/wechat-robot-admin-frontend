import { promises as fs } from 'node:fs';
import path from 'node:path';
import { generateApi } from 'swagger-typescript-api';

const gen = async ({ name, apiClassName, inputPath, outputPath }) => {
	await generateApi({
		name,
		apiClassName,
		input: inputPath,
		output: outputPath,
		httpClientType: 'axios',
		defaultResponseAsSuccess: false,
		generateClient: true,
		generateRouteTypes: true,
		generateResponses: true,
		extractRequestParams: false,
		extractRequestBody: false,
		extractEnums: false,
		unwrapResponseData: false,
		defaultResponseType: 'void',
		singleHttpClient: true,
		cleanOutput: false,
		prettier: {
			// By default prettier config is load from your project
			printWidth: 120,
			tabWidth: 2,
			trailingComma: 'all',
			parser: 'typescript',
		},
		extractingOptions: {
			requestBodySuffix: ['Payload', 'Body', 'Input'],
			requestParamsSuffix: ['Params'],
			responseBodySuffix: ['Data', 'Result', 'Output'],
			responseErrorSuffix: ['Error', 'Fail', 'Fails', 'ErrorData', 'HttpError', 'BadResponse'],
		},
		fixInvalidTypeNamePrefix: 'Type',
		fixInvalidEnumKeyPrefix: 'Value',
	})
		.then(({ files }) => {
			files.forEach(file => {
				console.log(file.fileName, ' -> \x1B[32msucceed\x1B[0m');
			});
		})
		.catch(e => console.error(e));
};

const genGlobalTs = async ({ globalTsImports, windowPropDecl }) => {
	const globalTs = `
${globalTsImports.join('\n')}

declare global {
	interface Window {
${windowPropDecl.map(item => `${' '.repeat(4)}${item}`).join('\n')}
	}
}
`;

	await fs.writeFile(path.resolve(process.cwd(), './src/@types/client.d.ts'), globalTs);
	console.log('全局类型声明文件 ->', '\x1B[32m生成成功\x1B[0m');
};

const genClientInit = async ({ clientImports, clients }) => {
	const clientInit = `import type { AxiosInterceptorOptions } from 'axios';
import qs from 'qs';
import type { AnyType } from '@/common/types';
${clientImports.join('\n')}

interface IReqInterceptor {
	onFulfilled?: ((value: AnyType) => AnyType | Promise<AnyType>) | null;
	onRejected?: ((error: AnyType) => AnyType) | null;
	options?: AxiosInterceptorOptions;
}

interface IResInterceptor {
	onFulfilled?: ((value: AnyType) => AnyType | Promise<AnyType>) | null;
	onRejected?: ((error: AnyType) => AnyType) | null;
}

export const clientInit = (options: {
	baseURL: string;
	reqInterceptors: IReqInterceptor[];
	respInterceptors: IResInterceptor[];
}) => {
	const { baseURL, reqInterceptors, respInterceptors } = options;

	const paramsSerializer = (params: AnyType) => {
		return qs.stringify(params, { addQueryPrefix: false, arrayFormat: 'repeat', allowDots: true });
	};

	${clients
		.map((item, index) => {
			const httpClient = `${item.replace(/Client$/, '')}HttpClient`;
			return `${index > 0 ? ' '.repeat(2) : ''}const _${httpClient} = new ${httpClient}({
		baseURL,
		paramsSerializer,
	});
	reqInterceptors.forEach(interceptor => {
		_${httpClient}.instance.interceptors.request.use(interceptor.onFulfilled, interceptor.onRejected, interceptor.options);
	});
	respInterceptors.forEach(interceptor => {
		_${httpClient}.instance.interceptors.response.use(interceptor.onFulfilled, interceptor.onRejected);
	});

	window.${item.replace(/^(\w)/, (_, char) => char.toLowerCase())} = new ${item}(_${httpClient});`;
		})
		.join('\n\n')}
};
`;

	await fs.writeFile(path.resolve(process.cwd(), './src/utils/clientInit.ts'), clientInit);
	console.log('客户端初始化文件 ->', '\x1B[32m生成成功\x1B[0m');
};

const start = async () => {
	const swaggersDir = path.resolve(process.cwd(), 'scripts', 'swagger');
	try {
		const files = await fs.readdir(swaggersDir);
		// global types
		const globalTsImports = [];
		const windowPropDecl = [];
		// client init
		const clientImports = [];
		const clients = [];
		debugger;
		for (const file of files) {
			if (path.extname(file) === '.json') {
				try {
					const prefix = file.replace('.swagger.json', '');
					const filename = prefix.replace('_', '-');
					const apiClassName = `${prefix.replace(/(?:^|_|-)(\w)/g, (_, char) => char.toUpperCase())}Client`;
					await gen({
						name: `${filename}.ts`,
						apiClassName,
						inputPath: path.resolve(process.cwd(), `./scripts/swagger/${file}`),
						outputPath: path.resolve(process.cwd(), `./src/api/${filename}`),
					});

					// global types
					globalTsImports.push(`import type { ${apiClassName} } from '@/api/${filename}/${filename}';`);
					windowPropDecl.push(
						`${apiClassName.replace(/^(\w)/, (_, char) => char.toLowerCase())}: ${apiClassName}<unknown>;`,
					);

					// client init
					const httpClient = `${apiClassName.replace(/Client$/, '')}HttpClient`;
					clientImports.push(
						`import { HttpClient as ${httpClient}, ${apiClassName} } from '@/api/${filename}/${filename}';`,
					);
					clients.push(apiClassName);
				} catch (err) {
					console.error(file, err);
				}
			}
		}

		await genGlobalTs({ globalTsImports, windowPropDecl });
		await genClientInit({ clientImports, clients });
	} catch (err) {
		console.error('Unable to scan directory:', err);
	}
};

start();
