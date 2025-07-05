import { useRequest } from 'ahooks';
import { App, Modal } from 'antd';
import React from 'react';

interface IProps {
	robotId: number;
	contactId: string;
	contactName: string;
	open: boolean;
	onRefresh: () => void;
	onClose: () => void;
}

const FriendDelete = (props: IProps) => {
	const { message } = App.useApp();

	const { runAsync, loading } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1ContactFriendDelete(
				{ id: props.robotId, contact_id: props.contactId },
				{ id: props.robotId },
			);
			return resp.data;
		},
		{
			manual: true,
			onSuccess: () => {
				message.success('已经成功删除好友');
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	return (
		<Modal
			title={`删除好友 ${props.contactName}`}
			width={380}
			open={props.open}
			confirmLoading={loading}
			onOk={async () => {
				await runAsync();
				props.onRefresh();
				props.onClose();
			}}
			okText="删除好友"
			okButtonProps={{ danger: true }}
			onCancel={props.onClose}
		>
			<p>确定要删除好友吗？</p>
		</Modal>
	);
};

export default React.memo(FriendDelete);
