import { Button, Form, Input } from 'antd';
import styled from 'styled-components';
import type { Api } from '@/api/wechat-robot/wechat-robot';

const Container = styled.div`
	width: 345px;
	border: 1px solid #ccc;
	border-radius: 14px;
	padding: 20px;
	box-shadow:
		rgba(0, 0, 0, 0.1) 0px 1px 3px 0px,
		rgba(0, 0, 0, 0.06) 0px 1px 2px 0px;
	transition: box-shadow 0.3s;
	border: none rgba(96, 184, 255, 0.145);
	background-color: #fff;
	color: rgb(62, 69, 85);
	margin: 150px auto 0 auto;
	display: flex;
	align-items: center;
	justify-content: flex-start;
	flex-direction: column;

	h1 {
		color: rgba(4, 122, 217, 1);
		text-align: center;
	}

	img {
		max-width: 300px;
		max-height: 300px;
		width: auto;
		height: auto;
	}

	p {
		font-size: 0.75rem;
		line-height: 1.5;
		font-family: Roboto, Helvetica, sans-serif;
		font-weight: 400;
		color: rgb(108, 122, 146);
		margin: 10px 0 16px 0;
		text-align: center;
		overflow-wrap: break-word;
		max-width: 300px;
	}
`;

const Login = () => {
	const [form] = Form.useForm<Api.UserServiceGetUserInfo.ResponseBody>();

	const onSignIn = async () => {
		const values = await form.validateFields();
		console.log('values', values);
	};

	return (
		<Container>
			<h1>微信机器人管理后台</h1>
			<img
				src="https://img.houhoukang.com/uranus/qrcode_for_gh.jpg"
				alt="二维码"
			/>
			<p>请使用微信扫描二维码关注公众号，输入「验证码」获取验证码（三分钟内有效）</p>
			<Form
				form={form}
				style={{ width: 300 }}
				labelCol={{ flex: '0 0 50px' }}
				wrapperCol={{ flex: '1 1 auto' }}
				autoComplete="off"
			>
				<Form.Item
					name="code"
					rules={[{ required: true, message: '请输入验证码' }]}
				>
					<Input
						placeholder="请输入6位数字验证码"
						size="large"
						allowClear
					/>
				</Form.Item>
				<Form.Item>
					<Button
						type="primary"
						size="large"
						block
						onClick={onSignIn}
					>
						登陆
					</Button>
				</Form.Item>
			</Form>
		</Container>
	);
};

export default Login;
