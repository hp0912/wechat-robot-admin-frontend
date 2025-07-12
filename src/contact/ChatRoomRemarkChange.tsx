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

const ChatRoomRemarkChange = (props: IProps) => {
	const { message } = App.useApp();

	const globalContext = useContext(GlobalContext);

	const [form] = Form.useForm<{ content: string }>();

	const { runAsync, loading } = useRequest(
		async (content: string) => {
			const resp = await window.wechatRobotClient.api.v1ChatRoomRemarkCreate(
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
				message.success('群备注修改成功');
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	return (
		<Modal
			title={`修改 ${props.chatRoomName} 群备注`}
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
					label="群备注"
					rules={[
						{ required: true, message: '请输入群备注' },
						{ max: 30, message: '群备注不能超过30个字符' },
					]}
				>
					<Input
						placeholder="请输入群备注"
						allowClear
					/>
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default React.memo(ChatRoomRemarkChange);
