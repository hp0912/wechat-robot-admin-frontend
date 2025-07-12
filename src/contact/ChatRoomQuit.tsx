import { useRequest } from 'ahooks';
import { App, Modal } from 'antd';
import React, { useContext } from 'react';
import { GlobalContext } from '@/context/global';

interface IProps {
	robotId: number;
	chatRoomId: string;
	chatRoomName: string;
	open: boolean;
	onRefresh: () => void;
	onClose: () => void;
}

const ChatRoomQuit = (props: IProps) => {
	const { message } = App.useApp();

	const globalContext = useContext(GlobalContext);

	const { runAsync, loading } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1ChatRoomQuitDelete(
				{ id: props.robotId },
				{
					id: props.robotId,
					chat_room_id: props.chatRoomId,
				},
			);
			return resp.data?.data;
		},
		{
			manual: true,
			onSuccess: () => {
				message.success('已经退出群聊');
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	return (
		<Modal
			title={`退出群聊 ${props.chatRoomName}`}
			width={globalContext.global?.isSmallScreen ? '100%' : 450}
			open={props.open}
			confirmLoading={loading}
			onOk={async () => {
				await runAsync();
				props.onRefresh();
				props.onClose();
			}}
			okText="退出群聊"
			okButtonProps={{ danger: true }}
			onCancel={props.onClose}
		>
			<p>确定要退出群聊吗？</p>
			<p>退出后将无法再接收该群聊的消息。</p>
			<p>请谨慎操作！</p>
		</Modal>
	);
};

export default React.memo(ChatRoomQuit);
