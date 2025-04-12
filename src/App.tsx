import { useRequest } from 'ahooks';
import { App as AntdApp, Skeleton, Watermark } from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import React, { Suspense } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import App404 from './404';
import AppLayout from './AppLayout';
import routers from './AppRoutes';
import { UserContext } from './context/user';
import { Init } from './utils/appInit';

dayjs.extend(customParseFormat);

Init();

const App = () => {
	const { message } = AntdApp.useApp();

	// 获取用户详情
	const { data: user, loading: userLoading } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.userServiceGetUserInfo();
			return resp.data;
		},
		{
			manual: false,
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	// 用户登出
	const { runAsync: signOut } = useRequest(
		async () => {
			await window.wechatRobotClient.api.userServiceLogout();
		},
		{
			manual: true,
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	if (!user || userLoading) {
		// return <Skeleton active />;
	}

	return (
		<UserContext.Provider value={{ user: user, signOut }}>
			<Router>
				<Suspense fallback={<Skeleton active />}>
					<Watermark
						content={`微信机器人管理后台: ${user?.username}`}
						font={{ color: 'rgba(0, 0, 0, 0.06)' }}
					>
						<Routes>
							<Route element={<AppLayout />}>
								{routers.map((router, index) => {
									return (
										<Route
											key={index}
											{...router}
										/>
									);
								})}
							</Route>
							<Route
								path="*"
								element={<App404 />}
							/>
						</Routes>
					</Watermark>
				</Suspense>
			</Router>
		</UserContext.Provider>
	);
};

export default React.memo(App);
