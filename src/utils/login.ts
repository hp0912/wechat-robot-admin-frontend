import { HttpClient, WechatRobotClient } from '@/api/wechat-robot/wechat-robot';
import { UrlLogin } from '@/constant/redirect-url';

// 保留 /user/self 的业务 401 响应，避免获取登录方式时再次触发登录重定向。
const loginClient = new WechatRobotClient(new HttpClient());
let redirecting = false;

export const loadLoginMethod = async () => {
	const { data } = await loginClient.user.selfList();
	if (data.code !== 200 && data.code !== 401) {
		throw new Error(data.message || '获取登录方式失败');
	}
	const loginMethod = data.data?.login_method;
	if (loginMethod !== 'token' && loginMethod !== 'scan') {
		throw new Error('未获取到有效的登录方式，请重试');
	}
	return loginMethod;
};

export const redirectToLogin = (loginMethod?: unknown) => {
	if (redirecting || window.location.pathname === UrlLogin) {
		return;
	}

	const params = new URLSearchParams({ redirect: window.location.href });
	if (loginMethod === 'token' || loginMethod === 'scan') {
		params.set('login_method', loginMethod);
	}
	redirecting = true;
	window.location.href = `${UrlLogin}?${params.toString()}`;
};
