import { ClockCircleOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { App, Button } from 'antd';
import React from 'react';

interface IProps {
	robotId: number;
	messageId: number;
}

const MessageRevoke = (props: IProps) => {
	const { message } = App.useApp();

	const { runAsync, loading } = useRequest(
		async () => {
			await window.wechatRobotClient.api.v1MessageRevokeCreate({
				id: props.robotId,
				message_id: props.messageId,
			});
		},
		{
			manual: true,
			onSuccess: () => {
				message.success('撤回成功');
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	return (
		<Button
			type="primary"
			ghost
			loading={loading}
			icon={<ClockCircleOutlined />}
			onClick={runAsync}
		>
			撤回
		</Button>
	);
};

export default React.memo(MessageRevoke);
