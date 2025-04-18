import { DeleteFilled } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { App, Button, Popconfirm, Tooltip } from 'antd';
import React from 'react';
import LoadingOutlined from '@/icons/LoadingOutlined';

interface IProps {
	robotId: number;
	onRefresh: () => void;
}

const Remove = (props: IProps) => {
	const { message } = App.useApp();

	const { runAsync, loading } = useRequest(
		async () => {
			await window.wechatRobotClient.api.v1RobotRemoveDelete({
				id: props.robotId,
			});
		},
		{
			manual: true,
			onSuccess: () => {
				message.success('删除成功');
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	if (loading) {
		return <LoadingOutlined />;
	}

	return (
		<Tooltip title="删除机器人">
			<Popconfirm
				title="删除机器人"
				description="确定要删除这个机器人吗？"
				okButtonProps={{ danger: true }}
				onConfirm={async () => {
					await runAsync();
					props.onRefresh();
				}}
				okText="删除"
				cancelText="取消"
			>
				<Button
					type="text"
					danger
					icon={<DeleteFilled />}
				/>
			</Popconfirm>
		</Tooltip>
	);
};

export default React.memo(Remove);
