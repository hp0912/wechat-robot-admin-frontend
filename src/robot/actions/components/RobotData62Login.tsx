import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Form, Input, Modal } from 'antd';
import React, { useContext } from 'react';
import { GlobalContext } from '@/context/global';

interface IProps {
	robotId: number;
	open: boolean;
	onClose: () => void;
	onRefresh: () => void;
}

const RobotData62Login = (props: IProps) => {
	const globalContext = useContext(GlobalContext);

	const [form] = Form.useForm<{ verify_content: string }>();

	return (
		<Modal
			title="登录iPhone设备"
			width={globalContext.global?.isSmallScreen ? '100%' : 475}
			open={props.open}
			// confirmLoading={loading}
			onOk={async () => {
				// const values = await form.validateFields();
				// await runAsync(values.verify_content);
				props.onClose();
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
					rules={[{ required: true, message: '请输入用户名' }]}
				>
					<Input
						prefix={<UserOutlined />}
						placeholder="请输入用户名"
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

export default React.memo(RobotData62Login);
