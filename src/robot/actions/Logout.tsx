import { LogoutOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { App, Button, Popconfirm, Tooltip } from 'antd';
import React from 'react';
import LoadingOutlined from '@/icons/LoadingOutlined';

interface IProps {
	robotId: number;
	onRefresh: () => void;
}

const Logout = (props: IProps) => {
	const { message } = App.useApp();

	const { runAsync, loading } = useRequest(
		async () => {
			await window.wechatRobotClient.api.v1RobotLogoutDelete({
				id: props.robotId,
			});
		},
		{
			manual: true,
			onSuccess: () => {
				message.success('已经退出登录');
			},
			onError: reason => {
				props.onRefresh();
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
		<Tooltip title="退出登录">
			<Popconfirm
				title="退出登录"
				description="确定要退出登录吗？"
				onConfirm={async () => {
					await runAsync();
					props.onRefresh();
				}}
				okText="登出"
				cancelText="取消"
			>
				<Button
					type="text"
					icon={<LogoutOutlined />}
				/>
			</Popconfirm>
		</Tooltip>
	);
};

export default React.memo(Logout);
