import React from 'react';
import type { RouteProps } from 'react-router-dom';

const RobotList = React.lazy(() => import(/* webpackChunkName: "robot-list" */ '@/robot'));

const routers: RouteProps[] = [
	{
		index: true,
		element: <RobotList />,
	},
];

export default routers;
