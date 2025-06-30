import { Skeleton } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import React, { Suspense } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import App404 from './404';
import AppLayout from './AppLayout';
import routers from './AppRoutes';
import { UrlLogin } from './constant/redirect-url';
import Login from './login';
import { Init } from './utils/appInit';

dayjs.extend(customParseFormat);
dayjs.extend(relativeTime);

Init();

const App = () => {
	return (
		<Router>
			<Suspense fallback={<Skeleton active />}>
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
						path={UrlLogin}
						element={<Login />}
					/>
					<Route
						path="*"
						element={<App404 />}
					/>
				</Routes>
			</Suspense>
		</Router>
	);
};

export default React.memo(App);
