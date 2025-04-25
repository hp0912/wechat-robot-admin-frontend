import { DeleteFilled } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { App, Button, Tooltip } from 'antd';
import React from 'react';
import LoadingOutlined from '@/icons/LoadingOutlined';

interface IProps {
	robotId: number;
	buttonText?: string;
	onRefresh: () => void;
}

const Remove = (props: IProps) => {
	const { message, modal } = App.useApp();

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

	const onRemove = () => {
		modal.confirm({
			title: '删除机器人',
			width: 275,
			content: '确定要删除这个机器人吗？',
			okText: '删除',
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
				icon={<DeleteFilled />}
				loading={loading}
				onClick={onRemove}
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
		<Tooltip title="删除机器人">
			<Button
				type="text"
				danger
				icon={<DeleteFilled />}
				onClick={onRemove}
			/>
		</Tooltip>
	);
};

export default React.memo(Remove);
