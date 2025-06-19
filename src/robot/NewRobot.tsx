import { useRequest } from 'ahooks';
import { App, Form, Input, Modal, notification } from 'antd';
import React from 'react';
import type { Api } from '@/api/wechat-robot/wechat-robot';

interface IProps {
	open: boolean;
	onClose: () => void;
	onRefresh: () => void;
}

const NewRobot = (props: IProps) => {
	const { message } = App.useApp();
	const [api, contextHolder] = notification.useNotification();

	const { open, onClose } = props;

	const [form] = Form.useForm<Api.V1RobotCreateCreate.RequestBody>();

	const { runAsync: onCreate, loading: createLoading } = useRequest(
		async (data: Api.V1RobotCreateCreate.RequestBody) => {
			const resp = await window.wechatRobotClient.api.v1RobotCreateCreate(data);
			api.success({
				message: '创建成功',
				description: (
					<>
						机器人创建成功，初始化机器人需要一些时间，请耐心等待。创建完成后点击机器人卡片中的<b>机器人图标</b>
						查看机器人详情。
					</>
				),
				duration: 0,
			});
			await new Promise(resolve => setTimeout(resolve, 15000)); // 等待15秒钟
			return resp.data;
		},
		{
			manual: true,
			onSuccess: () => {
				message.success('创建成功');
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	const onOk = async () => {
		const values = await form.validateFields();
		await onCreate(values);
		props.onRefresh?.();
		props.onClose();
	};

	return (
		<Modal
			title="创建机器人"
			open={open}
			okText="创建"
			onOk={onOk}
			confirmLoading={createLoading}
			onCancel={onClose}
		>
			<Form
				form={form}
				labelCol={{ flex: '0 0 95px' }}
				wrapperCol={{ flex: '1 1 auto' }}
				autoComplete="off"
			>
				<Form.Item
					name="robot_code"
					label="机器人编码"
					rules={[
						{ required: true, message: '机器人编码不能为空' },
						{ min: 5, message: '机器人编码至少输入5个字符' },
						{ max: 64, message: '机器人编码不能超过64个字符' },
						{ pattern: /^[a-zA-Z][a-zA-Z0-9_]+$/, message: '机器人编码必须以字母开头，且只能是字母、数字或下划线' },
					]}
				>
					<Input
						placeholder="请输入机器人编码"
						allowClear
					/>
				</Form.Item>
				{contextHolder}
			</Form>
		</Modal>
	);
};

export default React.memo(NewRobot);
