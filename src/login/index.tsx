import { LockOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { App, Button, Form, Input } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

	&.shake {
		animation: shake-animation 0.3s ease;
	}

	@keyframes shake-animation {
		0% {
			transform: translateX(0);
		}
		25% {
			transform: translateX(-8px);
		}
		50% {
			transform: translateX(8px);
		}
		75% {
			transform: translateX(-8px);
		}
		100% {
			transform: translateX(0);
		}
	}
`;

const Login = () => {
	const { message } = App.useApp();
	const navigate = useNavigate();

	const params = new URLSearchParams(window.location.search);
	const loginMethod = params.get('login_method') || 'scan';

	const [form] = Form.useForm<{ code: string; token: string }>();

	const [className, setClassName] = useState('');

	const { runAsync, loading } = useRequest(
		async (data: Api.V1OauthWechatCreate.RequestBody) => {
			const resp = await window.wechatRobotClient.api.v1OauthWechatCreate(data);
			return resp.data;
		},
		{
			manual: true,
			onError: reason => {
				message.error(reason.message);
				setClassName('shake');
				setTimeout(() => {
					setClassName('');
				}, 500);
			},
		},
	);

	const { runAsync: loginByToken, loading: loginLoading } = useRequest(
		async (data: Api.V1LoginCreate.RequestBody) => {
			const resp = await window.wechatRobotClient.api.v1LoginCreate(data);
			return resp.data;
		},
		{
			manual: true,
			onError: reason => {
				message.error(reason.message);
				setClassName('shake');
				setTimeout(() => {
					setClassName('');
				}, 500);
			},
		},
	);

	const onSignIn = async () => {
		const values = await form.validateFields();
		let resp: { code: number; message: string; data?: { success: boolean } } | undefined;
		if (loginMethod === 'scan') {
			resp = await runAsync(values);
		} else {
			resp = await loginByToken(values);
		}
		if (resp?.data?.success) {
			const search = new URLSearchParams(window.location.search);
			const redirect = search.get('redirect');
			if (redirect) {
				window.location.href = decodeURIComponent(redirect);
			} else {
				navigate('/');
			}
		}
	};

	return (
		<Container className={className}>
			<h1>微信机器人管理后台</h1>
			{loginMethod === 'scan' && (
				<>
					<img
						src="/api/v1/oauth/official-account/url"
						alt="二维码"
					/>
					<p>请使用微信扫描二维码关注公众号，输入「验证码」获取验证码（三分钟内有效）</p>
				</>
			)}
			<Form
				form={form}
				style={{ width: 300 }}
				labelCol={{ flex: '0 0 50px' }}
				wrapperCol={{ flex: '1 1 auto' }}
				autoComplete="off"
			>
				{loginMethod === 'scan' ? (
					<Form.Item
						name="code"
						rules={[{ required: true, message: '请输入验证码' }]}
					>
						<Input
							placeholder="请输入6位数字验证码"
							size="large"
							autoFocus
							allowClear
							onKeyDown={ev => {
								if (ev.key === 'Enter') {
									if (!loading) {
										onSignIn();
									}
								}
							}}
						/>
					</Form.Item>
				) : (
					<Form.Item
						name="token"
						rules={[{ required: true, message: '请输入登录密钥' }]}
					>
						<Input.Password
							placeholder="请输入登录密钥"
							size="large"
							prefix={<LockOutlined />}
							autoFocus
							allowClear
							onKeyDown={ev => {
								if (ev.key === 'Enter') {
									if (!loginLoading) {
										onSignIn();
									}
								}
							}}
						/>
					</Form.Item>
				)}
				<Form.Item>
					<Button
						type="primary"
						size="large"
						block
						loading={loading}
						onClick={onSignIn}
					>
						登录
					</Button>
				</Form.Item>
			</Form>
		</Container>
	);
};

export default Login;
