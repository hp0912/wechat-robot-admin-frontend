import { useRequest, useUpdateEffect } from 'ahooks';
import { App, Avatar, Card, Flex } from 'antd';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import type { Api } from '@/api/wechat-robot/wechat-robot';
import Login from './actions/Login';
import Logout from './actions/Logout';
import Remove from './actions/Remove';
import RestartClient from './actions/RestartClient';
import RestartServer from './actions/RestartServer';
import RobotMetadata from './actions/RobotMetadata';
import RobotState from './actions/RobotState';

interface IProps {
	robot: Api.V1RobotListList.ResponseBody['data']['items'][number];
	onRefresh: () => void;
}

const Robot = (props: IProps) => {
	const { message } = App.useApp();

	const [robot, setRobot] = useState(props.robot);

	const { refresh } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1RobotViewList({
				id: robot.id,
			});
			return resp.data?.data;
		},
		{
			manual: true,
			onSuccess: resp => {
				setRobot(resp);
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	useUpdateEffect(() => {
		setRobot(props.robot);
	}, [props.robot]);

	return (
		<Card
			loading={false}
			actions={[
				<RobotMetadata
					key="meta"
					robotId={robot.id}
					robotStatus={robot.status}
					onListRefresh={props.onRefresh}
					onDetailRefresh={refresh}
				/>,
				<RobotState
					key="refresh"
					robotId={robot.id}
					onRefresh={refresh}
				/>,
				<RestartClient
					key="restart-client"
					robotId={robot.id}
					onRefresh={refresh}
				/>,
				<RestartServer
					key="restart-server"
					robotId={robot.id}
					onRefresh={refresh}
				/>,
				<Remove
					key="remove"
					robotId={robot.id}
					onRefresh={props.onRefresh}
				/>,
			]}
			style={{ width: '100%' }}
			key={robot.id}
		>
			<Card.Meta
				avatar={<Avatar src={robot.avatar} />}
				title={
					<Flex
						align="start"
						justify="space-between"
					>
						{robot.status === 'online' ? (
							<>
								<div className="ellipsis">
									<span>{robot.nickname}</span>
								</div>
								<Logout
									robotId={robot.id}
									onRefresh={refresh}
								/>
							</>
						) : (
							<>
								<div className="ellipsis">
									<span style={{ color: 'gray' }}>未登录</span>
								</div>
								<Login
									robotId={robot.id}
									robot={props.robot}
									onRefresh={refresh}
								/>
							</>
						)}
					</Flex>
				}
				description={
					<>
						<p>机器人编码: {robot.robot_code}</p>
						<p>微信号: {robot.wechat_id || '-'}</p>
						<p>
							登录时间: {robot.last_login_at ? dayjs(robot.last_login_at * 1000).format('YYYY-MM-DD HH:mm:ss') : '-'}
						</p>
					</>
				}
			/>
		</Card>
	);
};

export default React.memo(Robot);
