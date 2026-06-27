import { useRequest } from 'ahooks';
import { App, Form, Input, Modal, Select } from 'antd';
import React from 'react';
import type * as Api from '@/api/wechat-robot/wechat-robot';

interface IProps {
	open: boolean;
	onSuccess: () => void;
	onClose: () => void;
	onRefresh: () => void;
}

const NewRobot = (props: IProps) => {
	const { message } = App.useApp();

	const { open, onClose } = props;

	const [form] = Form.useForm<Api.Robot.CreateCreate.RequestBody>();

	const { runAsync: onCreate, loading: createLoading } = useRequest(
		async (data: Api.Robot.CreateCreate.RequestBody) => {
			const resp = await window.wechatRobotClient.robot.createCreate(data);
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
		if (values.proxy?.ProxyIp === '' && values.proxy.ProxyUser === '' && values.proxy.ProxyPassword === '') {
			//
		} else if (values.proxy?.ProxyIp === '' || values.proxy?.ProxyUser === '' || values.proxy?.ProxyPassword === '') {
			message.error('请完整填写代理信息，或者全部留空');
			return;
		}
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
				layout="vertical"
				form={form}
				autoComplete="off"
				scrollToFirstError={{ behavior: 'instant', block: 'end', focus: true }}
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
				<Form.Item
					name="version"
					label="协议版本"
					rules={[{ required: true, message: '协议版本不能为空' }]}
					initialValue="8.0.59"
					help={
						<>
							<span style={{ color: '#e45c5c' }}>温馨提示: </span>:
							<span style={{ fontSize: 12 }}>
								优先使用 8.0.59 版本，如果 8.0.59 登录不上，再重新创建一个机器人，使用 8.0.74
								版本，机器人创建成功以后不支持切换协议版本
							</span>
						</>
					}
				>
					<Select
						options={[
							{ label: '8.0.59', value: '8.0.59' },
							{ label: '8.0.74', value: '8.0.74' },
						]}
					/>
				</Form.Item>
				<Form.Item
					name={['proxy', 'ProxyIp']}
					label="代理 IP"
					rules={[{ max: 15, message: '代理 IP 不能超过 15 个字符' }]}
					help="如果不使用代理，请留空"
				>
					<Input
						placeholder="请输入代理 IP"
						allowClear
					/>
				</Form.Item>
				<Form.Item
					name={['proxy', 'ProxyUser']}
					label="代理用户名"
					rules={[{ max: 64, message: '代理用户名不能超过 64 个字符' }]}
					help="如果不使用代理，请留空"
				>
					<Input
						placeholder="请输入代理用户名"
						allowClear
					/>
				</Form.Item>
				<Form.Item
					name={['proxy', 'ProxyPassword']}
					label="代理密码"
					rules={[{ max: 64, message: '代理密码不能超过 64 个字符' }]}
					help="如果不使用代理，请留空"
				>
					<Input
						placeholder="请输入代理密码"
						allowClear
					/>
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default React.memo(NewRobot);
