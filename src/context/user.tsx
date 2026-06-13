import React from 'react';
import * as Api from '@/api/wechat-robot/wechat-robot';

type IUser = NonNullable<Api.User.SelfList.ResponseBody['data']>;

interface IContext {
	user?: IUser;
	signOut: () => Promise<Api.User.LogoutDelete.ResponseBody>;
}

export const UserContext = React.createContext<IContext>({
	user: undefined,
	signOut: () => {
		return Promise.resolve({
			code: 200,
			message: '',
			data: {
				login_method: Api.ModelLoginMethod.LoginMethodToken,
			},
		});
	},
});
