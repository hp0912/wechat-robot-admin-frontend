import { ReloadOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { App, Button, Popconfirm, theme, Tooltip } from 'antd';
import React from 'react';
import LoadingOutlined from '@/icons/LoadingOutlined';

interface IProps {
	robotId: number;
	onRefresh: () => void;
}

const RestartServer = (props: IProps) => {
	const { token } = theme.useToken();
	const { message } = App.useApp();

	const { runAsync, loading } = useRequest(
		async () => {
			await window.wechatRobotClient.api.v1RobotRestartServerCreate({
				id: props.robotId,
			});
		},
		{
			manual: true,
			onSuccess: () => {
				message.success('重启服务端成功');
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	if (loading) {
		return (
			<Button
				type="text"
				icon={<LoadingOutlined spin />}
			/>
		);
	}

	return (
		<Tooltip title="重启机器人服务端">
			<Popconfirm
				title="重启机器人服务端"
				description="确定要重启这个机器人的服务端吗？"
				onConfirm={async () => {
					await runAsync();
					props.onRefresh();
				}}
				okText="重启服务端"
				cancelText="取消"
			>
				<Button
					type="text"
					danger
					icon={<ReloadOutlined style={{ color: token.colorWarning }} />}
				/>
			</Popconfirm>
		</Tooltip>
	);
};

export default React.memo(RestartServer);
