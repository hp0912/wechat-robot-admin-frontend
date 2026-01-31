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
	Space,
	Spin,
	Switch,
} from 'antd';
import type { DrawerProps } from 'antd';
import React, { useContext } from 'react';
import type { Api } from '@/api/wechat-robot/wechat-robot';
import ParamsGroup from '@/components/ParamsGroup';
import { DefaultAvatar } from '@/constant';
import { AiModels } from '@/constant/ai';
import { GlobalContext } from '@/context/global';
import AIDrawingSettingsEditor from './AIDrawingSettingsEditor';
import TTSettingsEditor from './TTSettingsEditor';
import { imageRecognitionModelTips, ObjectToString, onTTSEnabledChange } from './utils';

interface IProps {
	robotId: number;
	contact: Api.V1ContactListList.ResponseBody['data']['items'][number];
	open: boolean;
	onClose: () => void;
}

type IFormValue = Api.V1FriendSettingsCreate.RequestBody;

const FriendSettings = (props: IProps) => {
	const { message } = App.useApp();

	const globalContext = useContext(GlobalContext);

	const { contact } = props;

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

	// 加载好友设置
	const { data, loading } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1FriendSettingsList({
				id: props.robotId,
				contact_id: contact.wechat_id!,
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
		async (data: Api.V1FriendSettingsCreate.RequestBody) => {
			const resp = await window.wechatRobotClient.api.v1FriendSettingsCreate({ id: props.robotId }, data);
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
		await onSave({ ...values, wechat_id: contact.wechat_id!, config_id: configId, id: props.robotId });
	};

	const applyGlobalSettings = (type: 'chat' | 'drawing' | 'tts' | 'all') => {
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
			chat_base_url: globalSettings.data.chat_base_url,
			chat_api_key: globalSettings.data.chat_api_key,
			chat_model: globalSettings.data.chat_model,
			image_recognition_model: globalSettings.data.image_recognition_model,
			max_completion_tokens: globalSettings.data.max_completion_tokens,
			chat_prompt: globalSettings.data.chat_prompt,
		};
		const drawingSettings: Partial<IFormValue> = {
			image_ai_enabled: globalSettings.data.image_ai_enabled,
			image_ai_settings: imageAiSettings as unknown as object,
		};
		const ttsSettings: Partial<IFormValue> = {
			tts_enabled: globalSettings.data.tts_enabled,
			tts_settings: _ttsSettings as unknown as object,
			ltts_settings: _lttsSettings as unknown as object,
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
			case 'all':
				form.setFieldsValue({
					...chatSettings,
					...drawingSettings,
					...ttsSettings,
				});
				break;
			default:
				message.error('未知类型');
				return;
		}
	};

	let size: DrawerProps['size'] = 'large';
	if (globalContext.global?.size.width) {
		const { width } = globalContext.global.size;
		size = globalContext.global.isSmallScreen ? width * 0.99 : 900;
	}

	return (
		<Drawer
			title={
				<Row
					align="middle"
					wrap={false}
				>
					<Col flex="0 0 32px">
						<Avatar src={contact.avatar || DefaultAvatar} />
					</Col>
					<Col
						flex="0 1 auto"
						className="ellipsis"
						style={{ padding: '0 3px' }}
					>
						{contact.remark || contact.alias || contact.nickname || contact.wechat_id} 聊天设置
						{data?.data?.id === 0 && (
							<span style={{ fontSize: 12, color: '#ff5722' }}>
								(该好友未进行过任何设置{props.contact.type === 'official_account' ? null : '，运行时会继承全局设置'})
							</span>
						)}
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
			size={size}
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
							labelCol={{ flex: '0 0 130px' }}
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
												name="chat_base_url"
												label="API地址"
												labelCol={{ flex: '0 0 130px' }}
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
												labelCol={{ flex: '0 0 130px' }}
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
												labelCol={{ flex: '0 0 130px' }}
											>
												<AutoComplete
													placeholder="不填则使用全局配置"
													style={{ width: '100%' }}
													options={AiModels}
												/>
											</Form.Item>
											<Form.Item
												name="image_recognition_model"
												label="图像识别模型"
												labelCol={{ flex: '0 0 130px' }}
												tooltip={imageRecognitionModelTips}
											>
												<AutoComplete
													placeholder="不填则使用全局配置"
													style={{ width: '100%' }}
													options={AiModels}
												/>
											</Form.Item>
											<Form.Item
												name="max_completion_tokens"
												label="最大回复"
												labelCol={{ flex: '0 0 130px' }}
												tooltip="AI每次回复的最大词元个数，为0则表示不限制"
											>
												<InputNumber
													placeholder="请输入最大回复，为0则表示不限制"
													style={{ width: '100%' }}
													max={4096}
													min={0}
												/>
											</Form.Item>
											<Form.Item
												name="chat_prompt"
												label="人设"
												labelCol={{ flex: '0 0 130px' }}
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
												name="image_ai_settings"
												label="绘图设置"
											>
												<AIDrawingSettingsEditor />
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
															href="https://www.volcengine.com/docs/6561/1598757?lang=zh"
														>
															语音设置文档
														</a>
													</>
												}
											>
												<TTSettingsEditor />
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
				</Form>
			</Spin>
		</Drawer>
	);
};

export default React.memo(FriendSettings);
