import React from 'react';
import type { Api } from '@/api/wechat-robot/wechat-robot';

type IUser = Api.UserServiceGetUserInfo.ResponseBody;

interface IContext {
	user?: IUser;
	signOut: () => Promise<void>;
}

export const UserContext = React.createContext<IContext>({
	user: undefined,
	signOut: () => {
		return Promise.resolve();
	},
});
