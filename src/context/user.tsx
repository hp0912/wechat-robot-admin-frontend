import React from 'react';
import type { Api } from '@/api/wechat-robot/wechat-robot';

type IUser = Api.V1UserSelfList.ResponseBody['data'];

interface IContext {
	user?: IUser;
	signOut: () => Promise<Api.V1UserLogoutDelete.ResponseBody>;
}

export const UserContext = React.createContext<IContext>({
	user: undefined,
	signOut: () => {
		return Promise.resolve({
			code: 200,
			message: '',
			data: {
				login_method: '',
			},
		});
	},
});
