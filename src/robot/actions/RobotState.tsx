import { InteractionFilled } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { App, Button, Tooltip } from 'antd';
import React from 'react';
import LoadingOutlined from '@/icons/LoadingOutlined';

interface IProps {
	robotId: number;
	buttonText?: string;
	onRefresh: () => void;
}

const RobotState = (props: IProps) => {
	const { message } = App.useApp();

	const { runAsync, loading } = useRequest(
		async () => {
			await window.wechatRobotClient.api.v1RobotStateList({
				id: props.robotId,
			});
		},
		{
			manual: true,
			onSuccess: () => {
				message.success('刷新成功');
				props.onRefresh();
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	if (props.buttonText) {
		return (
			<Button
				type="primary"
				icon={<InteractionFilled />}
				loading={loading}
				onClick={runAsync}
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
		<Tooltip title="刷新机器人状态">
			<Button
				type="text"
				icon={<InteractionFilled />}
				onClick={runAsync}
			/>
		</Tooltip>
	);
};

export default React.memo(RobotState);
