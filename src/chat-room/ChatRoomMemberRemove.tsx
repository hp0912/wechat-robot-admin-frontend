import { useRequest } from 'ahooks';
import { Alert, App, Modal } from 'antd';
import React, { useContext } from 'react';
import { GlobalContext } from '@/context/global';

interface IProps {
	robotId: number;
	chatRoomId: string;
	chatRoomName: string;
	chatRoomMemberId: string;
	chatRoomMemberName: string;
	open: boolean;
	onRefresh: () => void;
	onClose: () => void;
}

const ChatRoomMemberRemove = (props: IProps) => {
	const { message } = App.useApp();

	const globalContext = useContext(GlobalContext);

	const { runAsync, loading } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1ChatRoomMembersDelete(
				{ id: props.robotId },
				{
					id: props.robotId,
					chat_room_id: props.chatRoomId,
					member_ids: [props.chatRoomMemberId],
				},
			);
			return resp.data?.data;
		},
		{
			manual: true,
			onSuccess: () => {
				message.success(`已成功将${props.chatRoomMemberName}移出群聊`);
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	return (
		<Modal
			title={`${props.chatRoomName}`}
			width={globalContext.global?.isSmallScreen ? '100%' : 390}
			open={props.open}
			confirmLoading={loading}
			onOk={async () => {
				await runAsync();
				props.onRefresh();
				props.onClose();
			}}
			okText="移出群聊"
			okButtonProps={{ danger: true }}
			onCancel={props.onClose}
		>
			<Alert
				type="warning"
				showIcon
				message={
					<>
						只有<b>群主</b>或者<b>管理员</b>才能将<span style={{ color: '#1710da' }}>普通成员</span>移出群聊。
					</>
				}
			/>
			<p>
				确定要将<b>{props.chatRoomMemberName}</b>移出群聊吗？
			</p>
		</Modal>
	);
};

export default React.memo(ChatRoomMemberRemove);
