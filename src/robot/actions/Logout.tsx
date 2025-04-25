import { LogoutOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { App, Button, Tooltip } from 'antd';
import React from 'react';
import LoadingOutlined from '@/icons/LoadingOutlined';

interface IProps {
	robotId: number;
	buttonText?: string;
	onRefresh: () => void;
}

const Logout = (props: IProps) => {
	const { message, modal } = App.useApp();

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

	const onLogout = () => {
		modal.confirm({
			title: '退出登录',
			width: 275,
			content: '确定要退出登录吗？',
			okText: '登出',
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
				type="text"
				icon={<LogoutOutlined />}
				loading={loading}
				onClick={onLogout}
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
		<Tooltip title="退出登录">
			<Button
				type="text"
				icon={<LogoutOutlined />}
				onClick={onLogout}
			/>
		</Tooltip>
	);
};

export default React.memo(Logout);
