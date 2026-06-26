import { useRequest } from 'ahooks';
import { App, Form, Input, Modal, Spin } from 'antd';
import React from 'react';
import type * as Api from '@/api/wechat-robot/wechat-robot';

interface IProps {
	open: boolean;
	robotId: number;
	onClose: () => void;
	onRefresh: () => void;
}

const RobotEditor = (props: IProps) => {
	const { message } = App.useApp();

	const { open, onClose } = props;

	const [form] = Form.useForm<Api.Robot.UpdateUpdate.RequestBody>();

	const { loading } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.robot.viewList({
				id: props.robotId,
			});
			return resp.data?.data;
		},
		{
			manual: false,
			onSuccess: data => {
				if (data) {
					form.setFieldsValue({
						robot_name: data.robot_name,
						proxy: {
							ProxyIp: data.proxy?.ProxyIp || '',
							ProxyUser: data.proxy?.ProxyUser || '',
							ProxyPassword: data.proxy?.ProxyPassword || '',
						},
					});
				}
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	const { runAsync: onUpdate, loading: updateLoading } = useRequest(
		async (data: Api.Robot.UpdateUpdate.RequestBody) => {
			const resp = await window.wechatRobotClient.robot.updateUpdate({ id: props.robotId }, data);
			return resp.data;
		},
		{
			manual: true,
			onSuccess: () => {
				message.success('更新成功');
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
		await onUpdate(values);
		props.onRefresh?.();
		props.onClose();
	};

	return (
		<Modal
			title="更新机器人"
			open={open}
			onOk={onOk}
			confirmLoading={updateLoading}
			onCancel={onClose}
		>
			<Spin spinning={loading}>
				<Form
					layout="vertical"
					form={form}
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
			</Spin>
		</Modal>
	);
};

export default React.memo(RobotEditor);
