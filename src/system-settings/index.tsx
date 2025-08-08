import { useRequest } from 'ahooks';
import { Alert, App, Button, Form, Input, InputNumber, Select, Spin, Switch } from 'antd';
import React from 'react';
import type { Api } from '@/api/wechat-robot/wechat-robot';
import { filterOption } from '@/common/filter-option';

interface IProps {
	robotId: number;
}

const SystemSettings = (props: IProps) => {
	const { message } = App.useApp();

	const [form] = Form.useForm<Api.V1SystemSettingsCreate.RequestBody>();

	const { loading } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1SystemSettingsList({
				id: props.robotId,
			});
			return resp.data?.data;
		},
		{
			manual: false,
			onSuccess: data => {
				if (data?.id) {
					form.setFieldsValue(data);
				}
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	const { runAsync: onSave, loading: saveLoading } = useRequest(
		async (data: Api.V1SystemSettingsCreate.RequestBody) => {
			const resp = await window.wechatRobotClient.api.v1SystemSettingsCreate(
				{
					...data,
					system_settings_id: data.id || 0,
					id: props.robotId,
				},
				{
					id: props.robotId,
				},
			);
			return resp.data?.data;
		},
		{
			manual: true,
			onSuccess: () => {
				message.success('保存成功');
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	const onOk = async () => {
		const values = await form.validateFields();
		onSave(values);
	};

	return (
		<Spin spinning={loading}>
			<Form
				form={form}
				labelCol={{ flex: '0 0 125px' }}
				wrapperCol={{ flex: '1 1 auto' }}
				autoComplete="off"
			>
				<Form.Item
					name="id"
					hidden
				>
					<Input />
				</Form.Item>
				<Form.Item
					name="offline_notification_enabled"
					label="离线通知"
					valuePropName="checked"
					initialValue={false}
				>
					<Switch
						unCheckedChildren="关闭"
						checkedChildren="开启"
					/>
				</Form.Item>
				<Form.Item
					noStyle
					shouldUpdate={(
						preValues: Api.V1SystemSettingsCreate.RequestBody,
						nextValues: Api.V1SystemSettingsCreate.RequestBody,
					) => {
						return preValues.offline_notification_enabled !== nextValues.offline_notification_enabled;
					}}
				>
					{({ getFieldValue }) => {
						if (!getFieldValue('offline_notification_enabled')) {
							return null;
						}
						return (
							<>
								<Form.Item
									name="notification_type"
									label="通知方式"
									rules={[{ required: true, message: '通知方式不能为空' }]}
									initialValue="push_plus"
								>
									<Select
										style={{ width: '100%' }}
										placeholder="请选择通知方式"
										showSearch
										allowClear
										filterOption={filterOption}
										options={[
											{ label: '推送加', value: 'push_plus', text: '推送加' },
											{ label: '邮件', value: 'email', disabled: true, text: '邮件' },
										]}
									/>
								</Form.Item>
								<Form.Item
									noStyle
									shouldUpdate={(
										preValues: Api.V1SystemSettingsCreate.RequestBody,
										nextValues: Api.V1SystemSettingsCreate.RequestBody,
									) => {
										return preValues.notification_type !== nextValues.notification_type;
									}}
								>
									{({ getFieldValue }) => {
										const notificationType = getFieldValue(
											'notification_type',
										) as Api.V1SystemSettingsCreate.RequestBody['notification_type'];
										if (notificationType === 'push_plus') {
											return (
												<>
													<Form.Item
														name="push_plus_url"
														label="[推送加]地址"
														rules={[{ required: true, message: '[推送加]地址不能为空' }]}
														initialValue="https://www.pushplus.plus/send"
														tooltip={
															<>
																<a
																	href="https://www.pushplus.plus/"
																	target="_blank"
																	rel="noreferrer"
																>
																	https://www.pushplus.plus/
																</a>
															</>
														}
													>
														<Input
															placeholder="请输入[推送加]地址"
															allowClear
														/>
													</Form.Item>
													<Form.Item
														name="push_plus_token"
														label="[推送加]密钥"
														rules={[{ required: true, message: '[推送加]密钥' }]}
														tooltip={
															<>
																<a
																	href="https://www.pushplus.plus/uc.html"
																	target="_blank"
																	rel="noreferrer"
																>
																	https://www.pushplus.plus/uc.html
																</a>
															</>
														}
													>
														<Input
															placeholder="请输入[推送加]密钥"
															allowClear
														/>
													</Form.Item>
												</>
											);
										}
										return null;
									}}
								</Form.Item>
							</>
						);
					}}
				</Form.Item>
				<Alert
					style={{ marginBottom: 24 }}
					type="warning"
					message="自动通过好友是高危操作，请谨慎使用！"
				/>
				<Form.Item
					name="auto_verify_user"
					label="自动通过好友"
					valuePropName="checked"
					initialValue={false}
				>
					<Switch
						unCheckedChildren="关闭"
						checkedChildren="开启"
					/>
				</Form.Item>
				<Form.Item
					noStyle
					shouldUpdate={(
						preValues: Api.V1SystemSettingsCreate.RequestBody,
						nextValues: Api.V1SystemSettingsCreate.RequestBody,
					) => {
						return preValues.auto_verify_user !== nextValues.auto_verify_user;
					}}
				>
					{({ getFieldValue }) => {
						if (!getFieldValue('auto_verify_user')) {
							return null;
						}
						return (
							<Form.Item
								name="verify_user_delay"
								label="延迟通过好友"
								rules={[{ required: true, message: '延迟通过好友不能为空' }]}
								initialValue={60}
								tooltip="延迟通过好友，避免被风控"
							>
								<InputNumber
									placeholder="请输入延迟通过好友时间"
									suffix="秒"
									style={{ width: '100%' }}
									max={600}
									min={0}
								/>
							</Form.Item>
						);
					}}
				</Form.Item>
				<Form.Item
					name="auto_chatroom_invite"
					label="自动邀请入群"
					valuePropName="checked"
					initialValue={false}
					tooltip={
						<>
							发送<b style={{ color: '#9c87e5' }}>申请进群 xxx群</b>
							&nbsp;(申请进群后面必须带空格，xxx群为群昵称)
							自动加入群聊，根据群昵称查找群聊，请确认联系人已经同步且群昵称没有重复
						</>
					}
				>
					<Switch
						unCheckedChildren="关闭"
						checkedChildren="开启"
					/>
				</Form.Item>
			</Form>
			<div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px' }}>
				<Button
					type="primary"
					loading={saveLoading}
					onClick={onOk}
				>
					保存
				</Button>
			</div>
		</Spin>
	);
};

export default React.memo(SystemSettings);
