import { useRequest } from 'ahooks';
import { App, Form, Input, Modal } from 'antd';
import React from 'react';

interface IProps {
	robotId: number;
	wechatId: string;
	nickname: string;
	open: boolean;
	onRefresh: () => void;
	onClose: () => void;
}

const FriendRemarkChange = (props: IProps) => {
	const { message } = App.useApp();

	const [form] = Form.useForm<{ content: string }>();

	const { runAsync, loading } = useRequest(
		async (content: string) => {
			const resp = await window.wechatRobotClient.api.v1ContactFriendRemarkCreate(
				{ id: props.robotId, to_wxid: props.wechatId, remarks: content },
				{
					id: props.robotId,
				},
			);
			return resp.data?.data;
		},
		{
			manual: true,
			onSuccess: () => {
				message.success('好友备注修改成功');
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	return (
		<Modal
			title={`修改 ${props.nickname} 好友备注`}
			width={500}
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
				labelCol={{ flex: '0 0 65px' }}
				wrapperCol={{ flex: '1 1 auto' }}
				autoComplete="off"
			>
				<Form.Item
					name="content"
					label="备注"
					rules={[
						{ required: true, message: '请输入备注' },
						{ max: 30, message: '备注不能超过30个字符' },
					]}
				>
					<Input
						placeholder="请输入备注"
						allowClear
					/>
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default React.memo(FriendRemarkChange);
