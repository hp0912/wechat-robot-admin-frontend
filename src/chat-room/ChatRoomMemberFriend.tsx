import { useRequest } from 'ahooks';
import { App, Form, Input, Modal } from 'antd';
import React, { useContext } from 'react';
import { GlobalContext } from '@/context/global';

interface IProps {
	robotId: number;
	chatRoomId: string;
	chatRoomName: string;
	chatRoomMemberId: number;
	chatRoomMemberName: string;
	open: boolean;
	onClose: () => void;
}

const ChatRoomMemberFriend = (props: IProps) => {
	const { message } = App.useApp();

	const globalContext = useContext(GlobalContext);

	const [form] = Form.useForm<{ verify_content: string }>();

	const { runAsync, loading } = useRequest(
		async (verifyContent: string) => {
			const resp = await window.wechatRobotClient.api.v1ContactFriendAddFromChatRoomCreate(
				{ id: props.robotId, chat_room_member_id: props.chatRoomMemberId, verify_content: verifyContent },
				{
					id: props.robotId,
				},
			);
			return resp.data?.data;
		},
		{
			manual: true,
			onSuccess: () => {
				message.success(`已成功添加为好友`);
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	return (
		<Modal
			title="添加好友"
			width={globalContext.global?.isSmallScreen ? '100%' : 550}
			open={props.open}
			confirmLoading={loading}
			onOk={async () => {
				const values = await form.validateFields();
				await runAsync(values.verify_content);
				props.onClose();
			}}
			okText="添加"
			onCancel={props.onClose}
		>
			<p>
				确定要将<b>{props.chatRoomName}</b>的${props.chatRoomMemberName}添加为好友吗？
			</p>
			<Form
				form={form}
				labelCol={{ flex: '0 0 110px' }}
				wrapperCol={{ flex: '1 1 auto' }}
				autoComplete="off"
			>
				<Form.Item
					name="verify_content"
					label="好友验证信息"
					rules={[
						{ required: true, message: '请输入好友验证信息' },
						{ max: 100, message: '好友验证信息不能超过100个字符' },
					]}
				>
					<Input.TextArea
						rows={5}
						placeholder="请输入好友验证信息"
						allowClear
					/>
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default React.memo(ChatRoomMemberFriend);
