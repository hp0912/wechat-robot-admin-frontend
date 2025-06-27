import { useRequest } from 'ahooks';
import { Alert, App, Form, Input, Modal } from 'antd';
import React from 'react';

interface IProps {
	robotId: number;
	chatRoomId: string;
	chatRoomName: string;
	open: boolean;
	onRefresh: () => void;
	onClose: () => void;
}

const ChatRoomAnnouncementChange = (props: IProps) => {
	const { message } = App.useApp();

	const [form] = Form.useForm<{ content: string }>();

	const { runAsync, loading } = useRequest(
		async (content: string) => {
			const resp = await window.wechatRobotClient.api.v1ChatRoomAnnouncementCreate(
				{ id: props.robotId },
				{
					id: props.robotId,
					chat_room_id: props.chatRoomId,
					content,
				},
			);
			return resp.data?.data;
		},
		{
			manual: true,
			onSuccess: () => {
				message.success('群公告发布成功');
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	return (
		<Modal
			title={`发布 ${props.chatRoomName} 群公告`}
			width={600}
			open={props.open}
			confirmLoading={loading}
			onOk={async () => {
				const values = await form.validateFields();
				await runAsync(values.content);
				props.onRefresh();
				props.onClose();
			}}
			onCancel={props.onClose}
		>
			<Alert
				showIcon
				type="warning"
				message={
					<>
						只有<b>群主</b>或者<b>群管理</b>才能发布群公告
					</>
				}
				style={{ marginBottom: 24 }}
			/>
			<Form
				form={form}
				labelCol={{ flex: '0 0 70px' }}
				wrapperCol={{ flex: '1 1 auto' }}
				autoComplete="off"
			>
				<Form.Item
					name="content"
					label="群公告"
					rules={[{ required: true, message: '请输入群公告' }]}
				>
					<Input.TextArea
						rows={5}
						placeholder="请输入群公告"
						allowClear
					/>
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default React.memo(ChatRoomAnnouncementChange);
