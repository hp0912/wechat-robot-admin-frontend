import { useRequest } from 'ahooks';
import { App, Form, Input, Modal } from 'antd';
import React from 'react';
import type { Api } from '@/api/wechat-robot/wechat-robot';

interface IProps {
	open: boolean;
	onSuccess: () => void;
	onClose: () => void;
	onRefresh: () => void;
}

const NewRobot = (props: IProps) => {
	const { message } = App.useApp();

	const { open, onClose } = props;

	const [form] = Form.useForm<Api.V1RobotCreateCreate.RequestBody>();

	const { runAsync: onCreate, loading: createLoading } = useRequest(
		async (data: Api.V1RobotCreateCreate.RequestBody) => {
			const resp = await window.wechatRobotClient.api.v1RobotCreateCreate(data);
			props.onSuccess();
			await new Promise(resolve => setTimeout(resolve, 20000)); // 等待20秒钟
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
					name="robot_name"
					label="机器人名称"
					rules={[
						{ required: true, message: '机器人名称不能为空' },
						{ min: 2, message: '机器人名称至少输入2个字符' },
						{ max: 12, message: '机器人名称不能超过12个字符' },
					]}
				>
					<Input
						placeholder="请输入机器人名称"
						allowClear
					/>
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default React.memo(NewRobot);
