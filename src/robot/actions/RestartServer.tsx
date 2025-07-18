import { PlayCircleFilled } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { App, Button, Tooltip } from 'antd';
import React from 'react';
import LoadingOutlined from '@/icons/LoadingOutlined';

interface IProps {
	robotId: number;
	buttonText?: string;
	onRefresh: () => void;
}

const RestartServer = (props: IProps) => {
	const { message, modal } = App.useApp();

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

	const onRestart = () => {
		modal.confirm({
			title: '重启机器人服务端',
			width: 330,
			content: (
				<>
					<p>
						确定要重启这个机器人的<b>服务端</b>吗？
					</p>
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
				icon={<PlayCircleFilled />}
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
		<Tooltip title="重启机器人服务端">
			<Button
				type="text"
				icon={<PlayCircleFilled />}
				onClick={onRestart}
			/>
		</Tooltip>
	);
};

export default React.memo(RestartServer);
