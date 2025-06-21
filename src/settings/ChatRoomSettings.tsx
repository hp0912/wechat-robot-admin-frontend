import { useRequest } from 'ahooks';
import {
	Alert,
	App,
	AutoComplete,
	Avatar,
	Button,
	Col,
	Drawer,
	Form,
	Input,
	InputNumber,
	Row,
	Select,
	Space,
	Spin,
	Switch,
} from 'antd';
import React from 'react';
import type { Api } from '@/api/wechat-robot/wechat-robot';
import ImageModel from '@/components/ImageModel';
import ParamsGroup from '@/components/ParamsGroup';
import { AiModels } from '@/constant/ai';
import { ObjectToString, onTTSEnabledChange } from './utils';

interface IProps {
	robotId: number;
	chatRoom: Api.V1ContactListList.ResponseBody['data']['items'][number];
	open: boolean;
	onClose: () => void;
}

type IFormValue = Api.V1ChatRoomSettingsCreate.RequestBody;

const ChatRoomSettings = (props: IProps) => {
	const { message } = App.useApp();

	const { chatRoom } = props;

	const [form] = Form.useForm<IFormValue>();

	// 加载全局配置
	const { data: globalSettings, loading: globalLoading } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1GlobalSettingsList({ id: props.robotId });
			return resp.data;
		},
		{
			manual: false,
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	// 加载群聊设置
	const { loading } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1ChatRoomSettingsList({
				id: props.robotId,
				chat_room_id: chatRoom.wechat_id!,
			});
			return resp.data;
		},
		{
			manual: false,
			onSuccess: resp => {
				if (!resp?.data) {
					return;
				}
				ObjectToString(resp.data);
				form.setFieldsValue(resp?.data || {});
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	const { runAsync: onSave, loading: saveLoading } = useRequest(
		async (data: Api.V1ChatRoomSettingsCreate.RequestBody) => {
			const resp = await window.wechatRobotClient.api.v1ChatRoomSettingsCreate({ id: props.robotId }, data);
			return resp.data;
		},
		{
			manual: true,
			onSuccess: () => {
				message.success('保存成功');
				props.onClose();
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	const onOk = async () => {
		const values = await form.validateFields();

		if (values.image_ai_enabled) {
			try {
				const json = JSON.parse(values.image_ai_settings as unknown as string);
				if (!json || typeof json !== 'object' || Array.isArray(json)) {
					message.error('绘图设置格式错误，不是有效的JSON对象格式');
					return;
				}
				values.image_ai_settings = json;
			} catch {
				message.error('绘图设置格式错误，不是有效的JSON对象格式');
				return;
			}
		}
		if (values.tts_enabled) {
			try {
				const json = JSON.parse(values.tts_settings as unknown as string);
				if (!json || typeof json !== 'object' || Array.isArray(json)) {
					message.error('语音设置格式错误，不是有效的JSON对象格式');
					return;
				}
				values.tts_settings = json;
				const json2 = JSON.parse(values.ltts_settings as unknown as string);
				if (!json2 || typeof json2 !== 'object' || Array.isArray(json2)) {
					message.error('长文本语音设置格式错误，不是有效的JSON对象格式');
					return;
				}
				values.ltts_settings = json2;
			} catch {
				message.error('语音设置格式错误，不是有效的JSON对象格式');
				return;
			}
		}
		const configId = values.id;
		await onSave({ ...values, chat_room_id: chatRoom.wechat_id!, config_id: configId, id: props.robotId });
	};

	const applyGlobalSettings = (type: 'chat' | 'drawing' | 'tts' | 'welcome' | 'leave_chat_room_alert' | 'all') => {
		if (!globalSettings?.data) {
			message.error('全局配置不存在');
			return;
		}
		const imageAiSettings = globalSettings.data.image_ai_settings
			? JSON.stringify(globalSettings.data.image_ai_settings, null, 2)
			: '{}';
		const _ttsSettings = globalSettings.data.tts_settings
			? JSON.stringify(globalSettings.data.tts_settings, null, 2)
			: '{}';
		const _lttsSettings = globalSettings.data.ltts_settings
			? JSON.stringify(globalSettings.data.ltts_settings, null, 2)
			: '{}';
		const chatSettings: Partial<IFormValue> = {
			chat_ai_enabled: globalSettings.data.chat_ai_enabled,
			chat_ai_trigger: globalSettings.data.chat_ai_trigger,
			chat_base_url: globalSettings.data.chat_base_url,
			chat_api_key: globalSettings.data.chat_api_key,
			chat_model: globalSettings.data.chat_model,
			chat_prompt: globalSettings.data.chat_prompt,
		};
		const drawingSettings: Partial<IFormValue> = {
			image_ai_enabled: globalSettings.data.image_ai_enabled,
			image_model: globalSettings.data.image_model,
			image_ai_settings: imageAiSettings as unknown as object,
		};
		const welcomeSettings: Partial<IFormValue> = {
			welcome_enabled: globalSettings.data.welcome_enabled,
			welcome_type: globalSettings.data.welcome_type,
			welcome_text: globalSettings.data.welcome_text,
			welcome_emoji_md5: globalSettings.data.welcome_emoji_md5,
			welcome_emoji_len: globalSettings.data.welcome_emoji_len,
			welcome_image_url: globalSettings.data.welcome_image_url,
			welcome_url: globalSettings.data.welcome_url,
		};
		const ttsSettings: Partial<IFormValue> = {
			tts_enabled: globalSettings.data.tts_enabled,
			tts_settings: _ttsSettings as unknown as object,
			ltts_settings: _lttsSettings as unknown as object,
		};
		const leaveChatRoomAlertSettings: Partial<IFormValue> = {
			leave_chat_room_alert_enabled: globalSettings.data.leave_chat_room_alert_enabled,
			leave_chat_room_alert_text: globalSettings.data.leave_chat_room_alert_text,
		};
		const otherSettings: Partial<IFormValue> = {
			chat_room_ranking_enabled: globalSettings.data.chat_room_ranking_enabled,
			chat_room_summary_enabled: globalSettings.data.chat_room_summary_enabled,
			chat_room_summary_model: globalSettings.data.chat_room_summary_model,
			news_enabled: globalSettings.data.news_enabled,
			news_type: globalSettings.data.news_type,
			morning_enabled: globalSettings.data.morning_enabled,
		};
		switch (type) {
			case 'chat':
				form.setFieldsValue(chatSettings);
				break;
			case 'drawing':
				form.setFieldsValue(drawingSettings);
				break;
			case 'tts':
				form.setFieldsValue(ttsSettings);
				break;
			case 'welcome':
				form.setFieldsValue(welcomeSettings);
				break;
			case 'leave_chat_room_alert':
				form.setFieldsValue(leaveChatRoomAlertSettings);
				break;
			case 'all':
				form.setFieldsValue({
					...chatSettings,
					...drawingSettings,
					...ttsSettings,
					...welcomeSettings,
					...leaveChatRoomAlertSettings,
					...otherSettings,
				});
				break;
			default:
				message.error('未知类型');
				return;
		}
	};

	return (
		<Drawer
			title={
				<Row
					align="middle"
					wrap={false}
				>
					<Col flex="0 0 32px">
						<Avatar src={chatRoom.avatar} />
					</Col>
					<Col
						flex="0 1 auto"
						className="ellipsis"
						style={{ padding: '0 3px' }}
					>
						{chatRoom.alias || chatRoom.nickname || chatRoom.wechat_id} 聊天设置
					</Col>
				</Row>
			}
			extra={
				<Space>
					<Button
						type="primary"
						loading={globalLoading}
						onClick={() => applyGlobalSettings('all')}
					>
						使用全局配置填充
					</Button>
				</Space>
			}
			open={props.open}
			onClose={props.onClose}
			width="900px"
			styles={{
				header: { paddingTop: 12, paddingBottom: 12 },
				body: { paddingTop: 16, paddingBottom: 0 },
				footer: { padding: 0 },
			}}
			footer={
				<Row style={{ overflow: 'hidden' }}>
					<Col
						span={12}
						style={{ borderRight: '1px solid #f0f0f0' }}
					>
						<Button
							size="large"
							type="text"
							block
							onClick={props.onClose}
						>
							取消
						</Button>
					</Col>
					<Col span={12}>
						<Button
							size="large"
							type="primary"
							block
							style={{ borderRadius: 0 }}
							loading={saveLoading}
							onClick={onOk}
						>
							确认
						</Button>
					</Col>
				</Row>
			}
		>
			<Spin spinning={loading || globalLoading}>
				<Form
					form={form}
					labelCol={{ flex: '0 0 95px' }}
					labelWrap
					wrapperCol={{ flex: '1 1 auto' }}
					autoComplete="off"
				>
					<Form.Item
						name="id"
						hidden
					>
						<Input />
					</Form.Item>
					<ParamsGroup
						title="AI聊天设置"
						style={{ marginTop: 10 }}
					>
						<>
							{!globalSettings?.data?.chat_ai_enabled && (
								<Alert
									style={{ marginTop: 10, marginBottom: 10 }}
									type="warning"
									description={<>全局设置下面的AI聊天设置未开启，当前设置将不会生效</>}
								/>
							)}
						</>
						<Form.Item
							name="chat_ai_enabled"
							label="聊天AI"
							valuePropName="checked"
						>
							<Switch
								unCheckedChildren="关闭"
								checkedChildren="开启"
							/>
						</Form.Item>
						<Form.Item
							noStyle
							shouldUpdate={(prev: IFormValue, next: IFormValue) => prev.chat_ai_enabled !== next.chat_ai_enabled}
						>
							{({ getFieldValue }) => {
								if (getFieldValue('chat_ai_enabled')) {
									return (
										<>
											<Form.Item
												name="chat_ai_trigger"
												label="AI触发词"
												tooltip="唤醒AI的关键词，以关键词开头的消息会被AI处理，而不用手动@AI"
											>
												<Input
													placeholder="请输入AI触发词，如果留空，则需要手动@AI"
													allowClear
												/>
											</Form.Item>
											<Form.Item
												name="chat_base_url"
												label="API地址"
												tooltip={
													<>
														示例:{' '}
														<a
															href="https://ai-api.houhoukang.com/"
															target="_blank"
															rel="noreferrer"
														>
															https://ai-api.houhoukang.com/
														</a>
													</>
												}
											>
												<Input
													placeholder="不填则使用全局配置"
													allowClear
												/>
											</Form.Item>
											<Form.Item
												name="chat_api_key"
												label="API密钥"
												tooltip={
													<>
														可前往
														<a
															href="https://ai-api.houhoukang.com/"
															target="_blank"
															rel="noreferrer"
														>
															https://ai-api.houhoukang.com/
														</a>
														获取
													</>
												}
											>
												<Input
													placeholder="不填则使用全局配置"
													allowClear
												/>
											</Form.Item>
											<Form.Item
												name="chat_model"
												label="聊天模型"
											>
												<AutoComplete
													placeholder="不填则使用全局配置"
													style={{ width: '100%' }}
													options={AiModels}
												/>
											</Form.Item>
											<Form.Item
												name="chat_prompt"
												label="人设"
												tooltip="人设是指在与AI进行对话时，系统会自动添加的提示信息，用于引导AI的回答方向和风格。"
											>
												<Input.TextArea
													rows={3}
													placeholder="不填则使用全局配置"
													allowClear
												/>
											</Form.Item>
										</>
									);
								}
								return null;
							}}
						</Form.Item>
						<Form.Item style={{ marginBottom: 6 }}>
							<div style={{ display: 'flex', justifyContent: 'flex-end' }}>
								<Button
									disabled={globalLoading}
									onClick={() => applyGlobalSettings('chat')}
								>
									使用全局配置填充AI聊天设置
								</Button>
							</div>
						</Form.Item>
					</ParamsGroup>
					<ParamsGroup
						title="AI绘图设置"
						style={{ marginTop: 24 }}
					>
						<>
							{!globalSettings?.data?.image_ai_enabled && (
								<Alert
									style={{ marginTop: 10, marginBottom: 10 }}
									type="warning"
									description={<>全局设置下面的AI绘图设置未开启，当前设置将不会生效</>}
								/>
							)}
						</>
						<Form.Item
							name="image_ai_enabled"
							label="绘图AI"
							valuePropName="checked"
						>
							<Switch
								unCheckedChildren="关闭"
								checkedChildren="开启"
							/>
						</Form.Item>
						<Form.Item
							noStyle
							shouldUpdate={(prev: IFormValue, next: IFormValue) => prev.image_ai_enabled !== next.image_ai_enabled}
						>
							{({ getFieldValue }) => {
								if (getFieldValue('image_ai_enabled')) {
									return (
										<>
											<Form.Item
												name="image_model"
												label="绘图模型"
											>
												<ImageModel placeholder="不填则使用全局配置" />
											</Form.Item>
											<Form.Item
												name="image_ai_settings"
												label="绘图设置"
											>
												<Input.TextArea
													rows={8}
													placeholder="不填则使用全局配置"
													allowClear
												/>
											</Form.Item>
										</>
									);
								}
								return null;
							}}
						</Form.Item>
						<Form.Item style={{ marginBottom: 6 }}>
							<div style={{ display: 'flex', justifyContent: 'flex-end' }}>
								<Button
									disabled={globalLoading}
									onClick={() => applyGlobalSettings('drawing')}
								>
									使用全局配置填充AI绘图设置
								</Button>
							</div>
						</Form.Item>
					</ParamsGroup>
					<ParamsGroup
						title="AI文本转语音设置"
						style={{ marginTop: 24 }}
					>
						<>
							{!globalSettings?.data?.tts_enabled && (
								<Alert
									style={{ marginTop: 10, marginBottom: 10 }}
									type="warning"
									description={<>全局设置下面的AI文本转语音设置未开启，当前设置将不会生效</>}
								/>
							)}
						</>
						<Form.Item
							name="tts_enabled"
							label="文本转语音"
							labelCol={{ flex: '0 0 110px' }}
							valuePropName="checked"
						>
							<Switch
								unCheckedChildren="关闭"
								checkedChildren="开启"
								onChange={(checked: boolean) => {
									onTTSEnabledChange(form, checked);
								}}
							/>
						</Form.Item>
						<Form.Item
							noStyle
							shouldUpdate={(prev: IFormValue, next: IFormValue) => prev.tts_enabled !== next.tts_enabled}
						>
							{({ getFieldValue }) => {
								if (getFieldValue('tts_enabled')) {
									return (
										<>
											<Form.Item
												name="tts_settings"
												label="语音设置"
												labelCol={{ flex: '0 0 110px' }}
												rules={[{ required: true, message: '语音设置不能为空' }]}
												tooltip={
													<>
														<a
															target="_blank"
															rel="noreferrer"
															href="https://www.volcengine.com/docs/6561/79823"
														>
															语音设置文档
														</a>
													</>
												}
											>
												<Input.TextArea
													rows={8}
													placeholder="请输入语音设置"
													allowClear
												/>
											</Form.Item>
											<Form.Item
												name="ltts_settings"
												label="长文本语音设置"
												labelCol={{ flex: '0 0 110px' }}
												rules={[{ required: true, message: '长文本语音设置不能为空' }]}
												tooltip={
													<>
														<a
															target="_blank"
															rel="noreferrer"
															href="https://www.volcengine.com/docs/6561/1096680"
														>
															长文本语音设置文档
														</a>
													</>
												}
											>
												<Input.TextArea
													rows={8}
													placeholder="请输入长文本语音设置"
													allowClear
												/>
											</Form.Item>
										</>
									);
								}
								return null;
							}}
						</Form.Item>
						<Form.Item style={{ marginBottom: 6 }}>
							<div style={{ display: 'flex', justifyContent: 'flex-end' }}>
								<Button
									disabled={globalLoading}
									onClick={() => applyGlobalSettings('tts')}
								>
									使用全局配置填充AI文本转语音设置
								</Button>
							</div>
						</Form.Item>
					</ParamsGroup>
					<ParamsGroup
						title="群聊欢迎新成员设置"
						style={{ marginTop: 24 }}
					>
						<>
							{!globalSettings?.data?.welcome_enabled && (
								<Alert
									style={{ marginTop: 10, marginBottom: 10 }}
									type="warning"
									description={<>全局设置下面的群聊欢迎新成员设置未开启，当前设置将不会生效</>}
								/>
							)}
						</>
						<Form.Item
							name="welcome_enabled"
							label="欢迎新成员"
							valuePropName="checked"
						>
							<Switch
								unCheckedChildren="关闭"
								checkedChildren="开启"
							/>
						</Form.Item>
						<Form.Item
							noStyle
							shouldUpdate={(prev: IFormValue, next: IFormValue) => prev.welcome_enabled !== next.welcome_enabled}
						>
							{({ getFieldValue }) => {
								if (getFieldValue('welcome_enabled')) {
									return (
										<>
											<Form.Item
												name="welcome_type"
												label="欢迎形式"
												rules={[{ required: true, message: '欢迎形式不能为空' }]}
											>
												<Select
													placeholder="请选择欢迎形式"
													style={{ width: '100%' }}
													options={[
														{ label: '纯文字', value: 'text' },
														{ label: '表情包', value: 'emoji' },
														{ label: '图片', value: 'image' },
														{ label: '卡片', value: 'url' },
													]}
												/>
											</Form.Item>
											<Form.Item
												noStyle
												shouldUpdate={(prev: IFormValue, next: IFormValue) => prev.welcome_type !== next.welcome_type}
											>
												{({ getFieldValue }) => {
													const type = getFieldValue('welcome_type');
													if (type === 'text') {
														return (
															<>
																<Form.Item
																	name="welcome_text"
																	label="欢迎语"
																	rules={[{ required: true, message: '欢迎语不能为空' }]}
																>
																	<Input
																		placeholder="请输入欢迎语"
																		allowClear
																	/>
																</Form.Item>
															</>
														);
													}
													if (type === 'emoji') {
														return (
															<>
																<Form.Item
																	name="welcome_emoji_md5"
																	label="表情包MD5"
																	rules={[{ required: true, message: '表情包MD5不能为空' }]}
																>
																	<Input
																		placeholder="请输入表情包MD5"
																		allowClear
																	/>
																</Form.Item>
																<Form.Item
																	name="welcome_emoji_len"
																	label="表情包长度"
																	rules={[{ required: true, message: '表情包长度不能为空' }]}
																>
																	<InputNumber
																		placeholder="请输入表情包长度"
																		min={1}
																		precision={0}
																		style={{ width: '100%' }}
																	/>
																</Form.Item>
															</>
														);
													}
													if (type === 'image') {
														return (
															<Form.Item
																name="welcome_image_url"
																label="图片地址"
																rules={[{ required: true, message: '图片地址不能为空' }]}
															>
																<Input
																	placeholder="请输入图片地址"
																	allowClear
																/>
															</Form.Item>
														);
													}
													if (type === 'url') {
														return (
															<>
																<Form.Item
																	name="welcome_text"
																	label="欢迎语"
																	rules={[{ required: true, message: '欢迎语不能为空' }]}
																>
																	<Input
																		placeholder="请输入欢迎语"
																		allowClear
																	/>
																</Form.Item>
																<Form.Item
																	name="welcome_url"
																	label="链接地址"
																	rules={[{ required: true, message: '链接地址不能为空' }]}
																>
																	<Input
																		placeholder="请输入链接地址"
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
								}
								return null;
							}}
						</Form.Item>
						<Form.Item style={{ marginBottom: 6 }}>
							<div style={{ display: 'flex', justifyContent: 'flex-end' }}>
								<Button
									disabled={globalLoading}
									onClick={() => applyGlobalSettings('welcome')}
								>
									使用全局配置填充群聊欢迎新成员设置
								</Button>
							</div>
						</Form.Item>
					</ParamsGroup>
					<ParamsGroup
						title="群聊退群提醒设置"
						style={{ marginTop: 24 }}
					>
						<>
							{!globalSettings?.data?.leave_chat_room_alert_enabled && (
								<Alert
									style={{ marginTop: 10, marginBottom: 10 }}
									type="warning"
									description={<>全局设置下面的群聊退群提醒设置未开启，当前设置将不会生效</>}
								/>
							)}
						</>
						<Form.Item
							name="leave_chat_room_alert_enabled"
							label="退群提醒"
							valuePropName="checked"
						>
							<Switch
								unCheckedChildren="关闭"
								checkedChildren="开启"
								onChange={(checked: boolean) => {
									if (checked && !form.getFieldValue('leave_chat_room_alert_text')) {
										form.setFieldsValue({
											leave_chat_room_alert_text: '阿拉蕾，{placeholder}',
										});
									}
								}}
							/>
						</Form.Item>
						<Form.Item
							noStyle
							shouldUpdate={(prev: IFormValue, next: IFormValue) =>
								prev.leave_chat_room_alert_enabled !== next.leave_chat_room_alert_enabled
							}
						>
							{({ getFieldValue }) => {
								if (getFieldValue('leave_chat_room_alert_enabled')) {
									return (
										<>
											<Form.Item
												name="leave_chat_room_alert_text"
												label="提醒文本"
												rules={[{ required: true, message: '提醒文本不能为空' }]}
											>
												<Input
													placeholder="请输入提醒文本"
													allowClear
												/>
											</Form.Item>
										</>
									);
								}
								return null;
							}}
						</Form.Item>
						<Form.Item style={{ marginBottom: 6 }}>
							<div style={{ display: 'flex', justifyContent: 'flex-end' }}>
								<Button
									disabled={globalLoading}
									onClick={() => applyGlobalSettings('leave_chat_room_alert')}
								>
									使用全局配置填充群聊退群提醒设置
								</Button>
							</div>
						</Form.Item>
					</ParamsGroup>
					<ParamsGroup
						title="群聊排行榜设置"
						style={{ marginTop: 24 }}
					>
						<>
							{!globalSettings?.data?.chat_room_ranking_enabled && (
								<Alert
									style={{ marginTop: 10, marginBottom: 10 }}
									type="warning"
									description={<>全局设置下面的群聊排行榜设置未开启，当前设置将不会生效</>}
								/>
							)}
						</>
						<Form.Item
							name="chat_room_ranking_enabled"
							label="排行榜"
							valuePropName="checked"
						>
							<Switch
								unCheckedChildren="关闭"
								checkedChildren="开启"
							/>
						</Form.Item>
					</ParamsGroup>
					<ParamsGroup
						title="群聊总结设置"
						style={{ marginTop: 24 }}
					>
						<>
							{!globalSettings?.data?.chat_room_summary_enabled && (
								<Alert
									style={{ marginTop: 10, marginBottom: 10 }}
									type="warning"
									description={<>全局设置下面的群聊总结设置未开启，当前设置将不会生效</>}
								/>
							)}
						</>
						<Form.Item
							name="chat_room_summary_enabled"
							label="群聊总结"
							valuePropName="checked"
						>
							<Switch
								unCheckedChildren="关闭"
								checkedChildren="开启"
							/>
						</Form.Item>
						<Form.Item
							noStyle
							shouldUpdate={(prev: IFormValue, next: IFormValue) =>
								prev.chat_room_summary_enabled !== next.chat_room_summary_enabled
							}
						>
							{({ getFieldValue }) => {
								if (getFieldValue('chat_room_summary_enabled')) {
									return (
										<>
											<Form.Item
												name="chat_room_summary_model"
												label="AI模型"
											>
												<AutoComplete
													placeholder="不填则使用全局配置"
													style={{ width: '100%' }}
													options={AiModels}
												/>
											</Form.Item>
										</>
									);
								}
								return null;
							}}
						</Form.Item>
					</ParamsGroup>
					<ParamsGroup
						title="每日早报设置"
						style={{ marginTop: 24 }}
					>
						<>
							{!globalSettings?.data?.news_enabled && (
								<Alert
									style={{ marginTop: 10, marginBottom: 10 }}
									type="warning"
									description={<>全局设置下面的每日早报设置未开启，当前设置将不会生效</>}
								/>
							)}
						</>
						<Form.Item
							name="news_enabled"
							label="每日早报"
							valuePropName="checked"
						>
							<Switch
								unCheckedChildren="关闭"
								checkedChildren="开启"
							/>
						</Form.Item>
						<Form.Item
							noStyle
							shouldUpdate={(prev: IFormValue, next: IFormValue) => prev.news_enabled !== next.news_enabled}
						>
							{({ getFieldValue }) => {
								if (getFieldValue('news_enabled')) {
									return (
										<>
											<Form.Item
												name="news_type"
												label="早报类型"
											>
												<Select
													placeholder="请选择早报类型"
													style={{ width: '100%' }}
													allowClear
													options={[
														{ label: '文字', value: 'text' },
														{ label: '图片', value: 'image' },
													]}
												/>
											</Form.Item>
										</>
									);
								}
								return null;
							}}
						</Form.Item>
					</ParamsGroup>
					<ParamsGroup
						title="每日早安设置"
						style={{ marginTop: 24 }}
					>
						<>
							{!globalSettings?.data?.morning_enabled && (
								<Alert
									style={{ marginTop: 10, marginBottom: 10 }}
									type="warning"
									description={<>全局设置下面的每日早安设置未开启，当前设置将不会生效</>}
								/>
							)}
						</>
						<Form.Item
							name="morning_enabled"
							label="每日早安"
							valuePropName="checked"
						>
							<Switch
								unCheckedChildren="关闭"
								checkedChildren="开启"
							/>
						</Form.Item>
					</ParamsGroup>
				</Form>
			</Spin>
		</Drawer>
	);
};

export default React.memo(ChatRoomSettings);
