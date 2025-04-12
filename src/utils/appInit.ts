import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import type { AnyType } from '@/common/types';
import { UrlLogin } from '@/constant/redirect-url';
import { clientInit } from './clientInit';

const baseURL = `${process.env.NODE_ENV === 'development' ? '/' : '/kms-server'}/`;

export const Init = () => {
	const errorWrapper = (stack: { code: number; message?: string; error?: string }) => {
		const error = new Error(stack.message || stack.error);
		Object.defineProperty(error, 'meta', { value: stack });
		return error;
	};

	const reqInterceptor = (config: InternalAxiosRequestConfig<AnyType>) => {
		return config;
	};

	const respInterceptor = (response: AxiosResponse<AnyType, AnyType>) => {
		const data = response.data as { code: number; error: string };
		switch (data.code) {
			case 200:
				return response;
			case 401:
				window.location.href = `${UrlLogin}?redirect=${encodeURIComponent(window.location.href)}`;
				return;
			default:
				return Promise.reject(errorWrapper(data));
		}
	};

	clientInit({
		baseURL,
		reqInterceptors: [{ onFulfilled: reqInterceptor }],
		respInterceptors: [{ onFulfilled: respInterceptor }],
	});
};
