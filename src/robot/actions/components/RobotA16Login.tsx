import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { App, Form, Input, Modal } from 'antd';
import React from 'react';
import type { Api } from '@/api/wechat-robot/wechat-robot';

type IRobot = Api.V1RobotListList.ResponseBody['data']['items'][number];

interface IProps {
	robotId: number;
	robot: IRobot;
	open: boolean;
	onClose: () => void;
	onRefresh: () => void;
}

const RobotA16Login = (props: IProps) => {
	const { message } = App.useApp();

	const [form] = Form.useForm<Api.V1RobotLoginA16Create.RequestBody>();

	const { runAsync, loading } = useRequest(
		async (data: Api.V1RobotLoginA16Create.RequestBody) => {
			const resp = await window.wechatRobotClient.api.v1RobotLoginA16Create(data, {
				id: props.robotId,
			});
			return resp.data?.data;
		},
		{
			manual: true,
			onSuccess: resp => {
				if (resp.authSectResp?.uin) {
					message.success(`登录成功`);
					props.onRefresh();
					props.onClose();
				} else {
					message.error(`登录失败，原因未知`);
				}
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	return (
		<Modal
			title="登录安卓手机设备"
			width="min(475px, calc(100vw - 32px))"
			open={props.open}
			confirmLoading={loading}
			onOk={async () => {
				const values = await form.validateFields();
				await runAsync(values);
			}}
			okText="登录"
			onCancel={props.onClose}
		>
			<Form
				form={form}
				labelCol={{ flex: '0 0 110px' }}
				wrapperCol={{ flex: '1 1 auto' }}
				autoComplete="off"
			>
				<Form.Item
					name="username"
					label=""
					rules={[{ required: true, message: '请输入微信ID' }]}
					initialValue={props.robot.wechat_id || ''}
				>
					<Input
						prefix={<UserOutlined />}
						placeholder="请输入微信ID"
						allowClear
					/>
				</Form.Item>
				<Form.Item
					name="password"
					label=""
					rules={[{ required: true, message: '请输入密码' }]}
				>
					<Input.Password
						prefix={<LockOutlined />}
						placeholder="请输入密码"
						allowClear
					/>
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default React.memo(RobotA16Login);
