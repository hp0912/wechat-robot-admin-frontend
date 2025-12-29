import { useRequest } from 'ahooks';
import { App, Form, Input, Modal } from 'antd';
import React from 'react';

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

const ChatRoomMemberSettings = (props: IProps) => {
	const { message } = App.useApp();

	const [form] = Form.useForm<{ username: string; verify_content: string }>();

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
			title={`${props.chatRoomName} / ${props.chatRoomMemberName} - 成员设置`}
			width={480}
			open={props.open}
			confirmLoading={loading}
			onOk={async () => {
				await runAsync();
				props.onRefresh();
				props.onClose();
			}}
			onCancel={props.onClose}
		>
			<Form
				form={form}
				labelCol={{ flex: '0 0 115px' }}
				wrapperCol={{ flex: '1 1 auto' }}
				autoComplete="off"
			>
				<Form.Item
					name="username"
					label="微信号/手机号"
					rules={[{ required: true, message: '请输入微信号/手机号' }]}
				>
					<Input placeholder="请输入微信号/手机号" />
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default React.memo(ChatRoomMemberSettings);
