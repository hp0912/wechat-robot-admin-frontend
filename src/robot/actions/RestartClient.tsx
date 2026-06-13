import { BulbFilled } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { App, Button, Tooltip } from 'antd';
import React from 'react';
import type * as Api from '@/api/wechat-robot/wechat-robot';
import LoadingOutlined from '@/icons/LoadingOutlined';

interface IProps {
	robotId: number;
	robot: NonNullable<Api.Robot.ViewList.ResponseBody['data']>;
	buttonText?: string;
	onRefresh: () => void;
}

const RestartClient = (props: IProps) => {
	const { message, modal } = App.useApp();

	const { runAsync, loading } = useRequest(
		async () => {
			await window.wechatRobotClient.robot.restartClientCreate(
				{ id: props.robotId },
				{
					id: props.robotId,
				},
			);
		},
		{
			manual: true,
			onSuccess: () => {
				message.success('重启客户端成功');
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	const onRestart = () => {
		modal.confirm({
			title: '重启机器人客户端',
			width: 320,
			content: (
				<>
					确定要重启机器人<b>{props.robot.robot_name}</b>的<b>客户端</b>吗？
				</>
			),
			okText: '重启',
			cancelText: '取消',
			onOk: async () => {
				await runAsync();
				props.onRefresh();
			},
		});
	};

	if (props.buttonText) {
		return (
			<Button
				type="primary"
				icon={<BulbFilled />}
				loading={loading}
				onClick={onRestart}
			>
				{props.buttonText}
			</Button>
		);
	}

	if (loading) {
		return (
			<Button
				type="text"
				icon={<LoadingOutlined spin />}
			/>
		);
	}

	return (
		<Tooltip title="重启机器人客户端">
			<Button
				type="text"
				icon={<BulbFilled />}
				onClick={onRestart}
			/>
		</Tooltip>
	);
};

export default React.memo(RestartClient);
