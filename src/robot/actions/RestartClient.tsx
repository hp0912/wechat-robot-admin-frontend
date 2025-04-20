import { BulbFilled } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { App, Button, Popconfirm, Tooltip } from 'antd';
import React from 'react';
import LoadingOutlined from '@/icons/LoadingOutlined';

interface IProps {
	robotId: number;
	onRefresh: () => void;
}

const RestartClient = (props: IProps) => {
	const { message } = App.useApp();

	const { runAsync, loading } = useRequest(
		async () => {
			await window.wechatRobotClient.api.v1RobotRestartClientCreate({
				id: props.robotId,
			});
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
			<Popconfirm
				title="重启机器人客户端"
				description={
					<>
						确定要重启这个机器人的<b>客户端</b>吗？
					</>
				}
				onConfirm={async () => {
					await runAsync();
					props.onRefresh();
				}}
				okText="重启"
				cancelText="取消"
			>
				<Button
					type="text"
					icon={<BulbFilled />}
				/>
			</Popconfirm>
		</Tooltip>
	);
};

export default React.memo(RestartClient);
