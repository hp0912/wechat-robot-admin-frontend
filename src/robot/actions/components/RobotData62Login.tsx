import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useMemoizedFn, useRequest, useSetState } from 'ahooks';
import { App, Button, Form, Input, Modal, Spin } from 'antd';
import React, { useContext, useEffect } from 'react';
import type { Api } from '@/api/wechat-robot/wechat-robot';
import { GlobalContext } from '@/context/global';

type IRobot = Api.V1RobotListList.ResponseBody['data']['items'][number];

interface IProps {
	robotId: number;
	robot: IRobot;
	open: boolean;
	onClose: () => void;
	onRefresh: () => void;
}

const RobotData62Login = (props: IProps) => {
	const { message } = App.useApp();

	const globalContext = useContext(GlobalContext);

	const [smsState, SetSmsState] = useSetState({ open: false, smsCode: '', countdown: 0 });

	const [form] = Form.useForm<Api.V1RobotLoginA16Create.RequestBody>();

	useEffect(() => {
		let timer: number | undefined;
		if (smsState.countdown > 0) {
			timer = window.setInterval(() => {
				SetSmsState({ countdown: smsState.countdown - 1 });
			}, 1000);
			return () => clearInterval(timer);
		}
		return () => {
			clearInterval(timer);
		};
	}, [smsState.countdown]);

	const { data, runAsync, loading } = useRequest(
		async (data: Api.V1RobotLoginData62Create.RequestBody) => {
			const resp = await window.wechatRobotClient.api.v1RobotLoginData62Create(data, {
				id: props.robotId,
			});
			return resp.data?.data;
		},
		{
			manual: true,
			onSuccess: resp => {
				if (resp.Cookie && resp.CheckUrl) {
					message.success(`已成功发送短信验证码`);
					SetSmsState({ open: true, smsCode: '', countdown: 60 });
				} else if (resp.authSectResp?.uin) {
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

	const { runAsync: smsAgain, loading: againLoading } = useRequest(
		async (data: Api.V1RobotLoginData62SmsAgainCreate.RequestBody) => {
			const resp = await window.wechatRobotClient.api.v1RobotLoginData62SmsAgainCreate(data, {
				id: props.robotId,
			});
			return resp.data?.data;
		},
		{
			manual: true,
			onSuccess: resp => {
				message.info(resp || '验证码已发送');
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	const { runAsync: smsVerify, loading: verifyLoading } = useRequest(
		async (data: Api.V1RobotLoginData62SmsVerifyCreate.RequestBody) => {
			const resp = await window.wechatRobotClient.api.v1RobotLoginData62SmsVerifyCreate(data, {
				id: props.robotId,
			});
			return resp.data?.data;
		},
		{
			manual: true,
			onSuccess: resp => {
				message.success(resp || '登录成功');
				props.onRefresh();
				props.onClose();
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	const onSmsClose = useMemoizedFn(() => {
		SetSmsState({ open: false, smsCode: '' });
	});

	return (
		<Modal
			title="登录iPhone设备"
			width={globalContext.global?.isSmallScreen ? '100%' : 475}
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
				{smsState.open && (
					<Modal
						title="请输入短信验证码"
						open={smsState.open}
						onCancel={onSmsClose}
						width={256}
						mask={{
							closable: false,
						}}
						footer={null}
					>
						<Spin
							spinning={verifyLoading}
							tip="正在验证..."
						>
							<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
								<Input.OTP
									value={smsState.smsCode}
									onChange={async value => {
										SetSmsState({ smsCode: value });
										if (value?.length && value.length >= 6) {
											await smsVerify({
												Cookie: data?.Cookie || '',
												Url: data?.CheckUrl || '',
												Sms: value,
											});
										}
									}}
								/>
							</div>
							<p style={{ margin: '16px 0 0 0', textAlign: 'right', fontSize: 12 }}>
								{!!smsState.countdown && <span>{smsState.countdown}秒后</span>}
								<Button
									type="link"
									size="small"
									loading={againLoading}
									disabled={smsState.countdown > 0}
									onClick={() => {
										smsAgain({
											Cookie: data?.Cookie || '',
											Url: data?.AgainUrl || '',
										});
									}}
								>
									重新发送
								</Button>
							</p>
						</Spin>
					</Modal>
				)}
			</Form>
		</Modal>
	);
};

export default React.memo(RobotData62Login);
