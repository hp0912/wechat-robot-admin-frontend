import { useRequest } from 'ahooks';
import { App, Form, Input, Modal } from 'antd';
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

const ChatRoomNameChange = (props: IProps) => {
	const { message } = App.useApp();

	const globalContext = useContext(GlobalContext);

	const [form] = Form.useForm<{ content: string }>();

	const { runAsync, loading } = useRequest(
		async (content: string) => {
			const resp = await window.wechatRobotClient.api.v1ChatRoomNameCreate(
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
				message.success('群名称修改成功');
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	return (
		<Modal
			title={`修改 ${props.chatRoomName} 群名称`}
			width={globalContext.global?.isSmallScreen ? '100%' : 500}
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
			<Form
				form={form}
				labelCol={{ flex: '0 0 70px' }}
				wrapperCol={{ flex: '1 1 auto' }}
				autoComplete="off"
			>
				<Form.Item
					name="content"
					label="群名称"
					rules={[
						{ required: true, message: '请输入群名称' },
						{ max: 30, message: '群名称不能超过30个字符' },
					]}
				>
					<Input
						placeholder="请输入群名称"
						allowClear
					/>
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default React.memo(ChatRoomNameChange);
