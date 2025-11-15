import { LoadingOutlined, RedoOutlined } from '@ant-design/icons';
import Editor from '@monaco-editor/react';
import { useRequest } from 'ahooks';
import { Alert, App, Button, Form, Input, InputNumber, Popconfirm, Select, Spin, Switch, Tooltip } from 'antd';
import React, { useState } from 'react';
import type { Api } from '@/api/wechat-robot/wechat-robot';
import { filterOption } from '@/common/filter-option';

interface IProps {
	robotId: number;
}

type IFormValues = Api.V1SystemSettingsCreate.RequestBody;

const JSONEditor = (props: { value?: string; onChange?: (value?: string) => void }) => {
	return (
		<div
			style={{
				border: '1px solid #d9d9d9',
				borderRadius: 6,
				padding: '8px 2px',
			}}
		>
			<Editor
				width="100%"
				height="250px"
				language="json"
				options={{
					minimap: { enabled: false },
					scrollBeyondLastLine: false,
				}}
				value={props.value}
				onChange={props.onChange}
				onMount={(editor, monaco) => {
					const model = editor.getModel();
					if (model) {
						monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
							validate: true,
							schemas: [
								{
									uri: 'http://myserver/webhook-headers-schema.json',
									fileMatch: [model.uri.toString()],
									schema: {
										type: 'object',
										description: 'HTTP 请求头配置',
										properties: {
											'Content-Type': {
												type: 'string',
												description: '内容类型',
												enum: [
													'application/json',
													'application/x-www-form-urlencoded',
													'multipart/form-data',
													'text/plain',
													'text/html',
												],
												default: 'application/json',
											},
											Authorization: {
												type: 'string',
												description: '授权信息，如: Bearer token 或 Basic base64',
											},
											'User-Agent': {
												type: 'string',
												description: '用户代理',
											},
											Accept: {
												type: 'string',
												description: '可接受的响应内容类型',
												default: 'application/json',
											},
											'X-API-Key': {
												type: 'string',
												description: 'API 密钥',
											},
											'X-Custom-Header': {
												type: 'string',
												description: '自定义请求头',
											},
										},
										additionalProperties: {
											type: 'string',
											description: '其他自定义请求头',
										},
									},
								},
							],
						});
					}
				}}
			/>
		</div>
	);
};

const SystemSettings = (props: IProps) => {
	const { message } = App.useApp();

	const [form] = Form.useForm<IFormValues>();

	const [apiToken, setApiToken] = useState('');

	const { loading, refresh } = useRequest(
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
					if (data.webhook_headers) {
						data.webhook_headers = JSON.stringify(data.webhook_headers, null, 2) as unknown as object;
					}
					form.setFieldsValue(data);
				}
				setApiToken(data?.api_token || '');
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	const { runAsync: refreshApiToken, loading: refreshLoading } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1UserApiTokenRefreshCreate();
			return resp.data?.data;
		},
		{
			manual: true,
			onSuccess: data => {
				if (data) {
					message.success('Api密钥刷新成功');
					setApiToken(data);
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
				refresh();
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	const onOk = async () => {
		const values = await form.validateFields();
		const webhookHeaders = values.webhook_headers as unknown as string;
		if (webhookHeaders?.trim()) {
			try {
				values.webhook_headers = JSON.parse(webhookHeaders);
			} catch {
				values.webhook_headers = {};
			}
		} else {
			values.webhook_headers = {};
		}
		onSave(values);
	};

	return (
		<Spin spinning={loading}>
			<div style={{ maxHeight: 'calc(100vh - 180px)', overflow: 'auto' }}>
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
						name="webhook_url"
						label="Webhook 地址"
					>
						<Input
							pattern="请输入 Webhook 地址"
							addonBefore={<b style={{ color: '#EF6820' }}>POST</b>}
							allowClear
						/>
					</Form.Item>
					<Form.Item
						style={{ flexWrap: 'nowrap' }}
						name="webhook_headers"
						label="Webhook 请求头"
						initialValue={'{\n    \n}'}
					>
						<JSONEditor />
					</Form.Item>
					<Form.Item
						name="api_token_enabled"
						label="Api密钥调用接口"
						valuePropName="checked"
						initialValue={false}
					>
						<Switch
							unCheckedChildren="关闭"
							checkedChildren="开启"
						/>
					</Form.Item>
					<Form.Item
						label="Api密钥"
						hidden={!apiToken}
						tooltip="Api密钥用于调用接口，刷新后以前的Api密钥将失效，支持Authorization Header、X-API-Token Header、api_token Query参数三种方式调用接口 (界面上所有需要登录态的接口均可使用Api密钥调用)"
					>
						<Input
							value={apiToken}
							readOnly
							suffix={
								<Tooltip title="刷新 Api 密钥">
									{refreshLoading ? (
										<LoadingOutlined />
									) : (
										<Popconfirm
											title="刷新Api密钥"
											description="刷新后以前的Api密钥将失效，是否继续？"
											onConfirm={refreshApiToken}
											okText="刷新"
										>
											<RedoOutlined />
										</Popconfirm>
									)}
								</Tooltip>
							}
						/>
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
																	页面的用户token
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
						message={
							<>自动通过好友是高危操作，请谨慎使用！如果同一时间有多个好友请求，每个好友请求通过之后会休眠10秒钟。</>
						}
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
			</div>
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
