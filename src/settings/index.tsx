import { useRequest } from 'ahooks';
import { Alert, App, AutoComplete, Button, Form, Input, InputNumber, Select, Spin, Switch, TimePicker } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import type { Api } from '@/api/wechat-robot/wechat-robot';
import type { AnyType } from '@/common/types';
import ImageModel from '@/components/ImageModel';
import ParamsGroup from '@/components/ParamsGroup';
import { AiModels } from '@/constant/ai';
import {
	fromCronExpression,
	generateMondayCronExpression,
	generateMonthlyCronExpression,
	parseMondayCronExpression,
	parseMonthlyCronExpression,
	toCronExpression,
} from '@/utils';

interface IProps {
	robotId: number;
}

type IFormValue = Api.V1GlobalSettingsCreate.RequestBody;

const GlobalSettings = (props: IProps) => {
	const { message } = App.useApp();

	const [form] = Form.useForm<IFormValue>();

	const validateCron = (cron: dayjs.Dayjs) => {
		return toCronExpression(cron.hour(), cron.minute());
	};

	const validateMondayCron = (cron: dayjs.Dayjs) => {
		return generateMondayCronExpression(cron.hour(), cron.minute());
	};

	const validateMonthlyCron = (cron: dayjs.Dayjs) => {
		return generateMonthlyCronExpression(cron.hour(), cron.minute());
	};

	const cronToDayjs = (cron: string) => {
		const { minute, hour } = fromCronExpression(cron);
		return dayjs().hour(hour).minute(minute).second(0).millisecond(0);
	};

	const mondayCronToDayjs = (cron: string) => {
		const { minute, hour } = parseMondayCronExpression(cron);
		return dayjs().hour(hour).minute(minute).second(0).millisecond(0);
	};

	const monthlyCronToDayjs = (cron: string) => {
		const { minute, hour } = parseMonthlyCronExpression(cron);
		return dayjs().hour(hour).minute(minute).second(0).millisecond(0);
	};

	const { loading, refresh } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1GlobalSettingsList({ id: props.robotId });
			return resp.data;
		},
		{
			manual: false,
			onSuccess: resp => {
				if (!resp?.data) {
					return;
				}
				if (resp.data.image_ai_settings && typeof resp.data.image_ai_settings === 'object') {
					resp.data.image_ai_settings = JSON.stringify(resp.data.image_ai_settings, null, 2) as unknown as object;
				}
				if (resp.data.friend_sync_cron) {
					resp.data.friend_sync_cron = '1';
				}
				const cronFields: (keyof Api.V1GlobalSettingsList.ResponseBody['data'])[] = [
					'chat_room_ranking_daily_cron',
					'chat_room_summary_cron',
					'morning_cron',
					'news_cron',
				];
				for (const field of cronFields) {
					if (resp.data[field]) {
						const cronValue = resp.data[field] as string;
						(resp.data as AnyType)[field] = cronToDayjs(cronValue);
					}
				}
				if (resp.data.chat_room_ranking_weekly_cron) {
					const cronValue = resp.data.chat_room_ranking_weekly_cron as string;
					(resp.data as AnyType).chat_room_ranking_weekly_cron = mondayCronToDayjs(cronValue);
				}
				if (resp.data.chat_room_ranking_month_cron) {
					const cronValue = resp.data.chat_room_ranking_month_cron as string;
					(resp.data as AnyType).chat_room_ranking_month_cron = monthlyCronToDayjs(cronValue);
				}
				form.setFieldsValue(resp?.data || {});
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	const { runAsync: onSave, loading: saveLoading } = useRequest(
		async (data: Api.V1GlobalSettingsCreate.RequestBody) => {
			const resp = await window.wechatRobotClient.api.v1GlobalSettingsCreate({ id: props.robotId }, data);
			return resp.data;
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
		const configId = values.id;
		const cronFields: (keyof Api.V1GlobalSettingsCreate.RequestBody)[] = [
			'chat_room_ranking_daily_cron',
			'chat_room_summary_cron',
			'morning_cron',
			'news_cron',
		];
		for (const field of cronFields) {
			if (values[field]) {
				const cronValue = values[field] as dayjs.Dayjs;
				(values as AnyType)[field] = validateCron(cronValue);
			}
		}
		if (values.chat_room_ranking_weekly_cron) {
			const cronValue = values.chat_room_ranking_weekly_cron as unknown as dayjs.Dayjs;
			(values as AnyType).chat_room_ranking_weekly_cron = validateMondayCron(cronValue);
		}
		if (values.chat_room_ranking_month_cron) {
			const cronValue = values.chat_room_ranking_month_cron as unknown as dayjs.Dayjs;
			(values as AnyType).chat_room_ranking_month_cron = validateMonthlyCron(cronValue);
		}
		await onSave({ ...values, config_id: configId, id: props.robotId });
	};

	return (
		<div>
			<Spin spinning={loading}>
				<div style={{ maxHeight: 'calc(100vh - 180px)', overflow: 'auto' }}>
					<Form
						form={form}
						labelCol={{ flex: '0 0 95px' }}
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
							<Alert
								style={{ marginTop: 10, marginBottom: 10 }}
								type="info"
								description={
									<>
										开启AI聊天设置会自动应用于每一个好友和群聊，也可以在<b>好友设置</b>和<b>群聊设置</b>
										里面单独定制化设置。
									</>
								}
							/>
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
													rules={[{ required: true, message: 'API地址不能为空' }]}
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
														placeholder="请输入API地址"
														allowClear
													/>
												</Form.Item>
												<Form.Item
													name="chat_api_key"
													label="API密钥"
													rules={[{ required: true, message: 'API密钥不能为空' }]}
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
														placeholder="请输入API密钥"
														allowClear
													/>
												</Form.Item>
												<Form.Item
													name="chat_model"
													label="聊天模型"
													rules={[{ required: true, message: '聊天模型不能为空' }]}
												>
													<AutoComplete
														placeholder="请选择或者手动输入聊天模型"
														style={{ width: '100%' }}
														options={AiModels}
													/>
												</Form.Item>
												<Form.Item
													name="chat_prompt"
													label="人设"
													rules={[{ required: true, message: '人设不能为空' }]}
													tooltip="人设是指在与AI进行对话时，系统会自动添加的提示信息，用于引导AI的回答方向和风格。"
												>
													<Input.TextArea
														rows={3}
														placeholder="请输入人设"
														allowClear
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
							title="AI绘图设置"
							style={{ marginTop: 24 }}
						>
							<Alert
								style={{ marginTop: 10, marginBottom: 10 }}
								type="info"
								description={
									<>
										开启AI绘图设置会自动应用于每一个好友和群聊，也可以在<b>好友设置</b>和<b>群聊设置</b>
										里面单独定制化设置。
									</>
								}
							/>
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
													rules={[{ required: true, message: '绘图模型不能为空' }]}
												>
													<ImageModel placeholder="请选择或者手动输入绘图模型" />
												</Form.Item>
												<Form.Item
													name="image_ai_settings"
													label="绘图设置"
													rules={[{ required: true, message: '绘图设置不能为空' }]}
												>
													<Input.TextArea
														rows={8}
														placeholder="请输入绘图设置"
														allowClear
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
							title="群聊欢迎新成员设置"
							style={{ marginTop: 24 }}
						>
							<Alert
								style={{ marginTop: 10, marginBottom: 10 }}
								type="info"
								description={
									<>
										开启欢迎新成员会自动应用于每一个群聊，也可以在<b>群聊设置</b>里面单独定制化设置。
									</>
								}
							/>
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
						</ParamsGroup>
						<ParamsGroup
							title="群聊排行榜设置"
							style={{ marginTop: 24 }}
						>
							<Alert
								style={{ marginTop: 10, marginBottom: 10 }}
								type="warning"
								description={
									<>
										群聊排行榜设置<b>不会</b>自动应用于每一个群聊，需要在<b>群聊设置</b>里面手动开启。
									</>
								}
							/>
							<Form.Item
								name="chat_room_ranking_enabled"
								label="排行榜"
								valuePropName="checked"
								labelCol={{ flex: '0 0 120px' }}
							>
								<Switch
									unCheckedChildren="关闭"
									checkedChildren="开启"
								/>
							</Form.Item>
							<Form.Item
								noStyle
								shouldUpdate={(prev: IFormValue, next: IFormValue) =>
									prev.chat_room_ranking_enabled !== next.chat_room_ranking_enabled
								}
							>
								{({ getFieldValue }) => {
									if (getFieldValue('chat_room_ranking_enabled')) {
										return (
											<>
												<Form.Item
													name="chat_room_ranking_daily_cron"
													label="发榜时间(每天)"
													rules={[{ required: true, message: '发榜时间不能为空' }]}
													labelCol={{ flex: '0 0 120px' }}
												>
													<TimePicker
														disabledTime={() => {
															return {
																disabledSeconds: () => Array.from({ length: 59 }, (_, i) => i + 1),
															};
														}}
													/>
												</Form.Item>
												<Form.Item
													name="chat_room_ranking_weekly_cron"
													label="发榜时间(每周)"
													labelCol={{ flex: '0 0 120px' }}
												>
													<TimePicker
														disabledTime={() => {
															return {
																disabledSeconds: () => Array.from({ length: 59 }, (_, i) => i + 1),
															};
														}}
													/>
												</Form.Item>
												<Form.Item
													name="chat_room_ranking_month_cron"
													label="发榜时间(每月)"
													labelCol={{ flex: '0 0 120px' }}
												>
													<TimePicker
														disabledTime={() => {
															return {
																disabledSeconds: () => Array.from({ length: 59 }, (_, i) => i + 1),
															};
														}}
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
							title="群聊总结设置"
							style={{ marginTop: 24 }}
						>
							<Alert
								style={{ marginTop: 10, marginBottom: 10 }}
								type="warning"
								description={
									<>
										群聊总结设置<b>不会</b>自动应用于每一个群聊，需要在<b>群聊设置</b>里面手动开启。
									</>
								}
							/>
							<Form.Item
								name="chat_room_summary_enabled"
								label="群聊总结"
								valuePropName="checked"
								labelCol={{ flex: '0 0 120px' }}
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
													rules={[{ required: true, message: 'AI模型不能为空' }]}
													labelCol={{ flex: '0 0 120px' }}
												>
													<AutoComplete
														placeholder="请选择或者手动输入AI模型"
														style={{ width: '100%' }}
														options={AiModels}
													/>
												</Form.Item>
												<Form.Item
													name="chat_room_summary_cron"
													label="总结时间(每天)"
													labelCol={{ flex: '0 0 120px' }}
													rules={[{ required: true, message: '总结时间不能为空' }]}
												>
													<TimePicker
														disabledTime={() => {
															return {
																disabledSeconds: () => Array.from({ length: 59 }, (_, i) => i + 1),
															};
														}}
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
							<Alert
								style={{ marginTop: 10, marginBottom: 10 }}
								type="warning"
								description={
									<>
										每日早报设置<b>不会</b>自动应用于每一个群聊，需要在<b>群聊设置</b>里面手动开启。
									</>
								}
							/>
							<Form.Item
								name="news_enabled"
								label="每日早报"
								valuePropName="checked"
								labelCol={{ flex: '0 0 120px' }}
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
													rules={[{ required: true, message: '早报类型不能为空' }]}
													labelCol={{ flex: '0 0 120px' }}
												>
													<Select
														placeholder="请选择早报类型"
														style={{ width: '100%' }}
														options={[
															{ label: '文字', value: 'text' },
															{ label: '图片', value: 'image' },
														]}
													/>
												</Form.Item>
												<Form.Item
													name="news_cron"
													label="发布时间(每天)"
													labelCol={{ flex: '0 0 120px' }}
													rules={[{ required: true, message: '发布时间不能为空' }]}
												>
													<TimePicker
														disabledTime={() => {
															return {
																disabledSeconds: () => Array.from({ length: 59 }, (_, i) => i + 1),
															};
														}}
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
							<Alert
								style={{ marginTop: 10, marginBottom: 10 }}
								type="warning"
								description={
									<>
										每日早安设置<b>不会</b>自动应用于每一个群聊，需要在<b>群聊设置</b>里面手动开启。
									</>
								}
							/>
							<Form.Item
								name="morning_enabled"
								label="每日早安"
								valuePropName="checked"
								labelCol={{ flex: '0 0 120px' }}
							>
								<Switch
									unCheckedChildren="关闭"
									checkedChildren="开启"
								/>
							</Form.Item>
							<Form.Item
								noStyle
								shouldUpdate={(prev: IFormValue, next: IFormValue) => prev.morning_enabled !== next.morning_enabled}
							>
								{({ getFieldValue }) => {
									if (getFieldValue('morning_enabled')) {
										return (
											<>
												<Form.Item
													name="morning_cron"
													label="发布时间(每天)"
													labelCol={{ flex: '0 0 120px' }}
													rules={[{ required: true, message: '发布时间不能为空' }]}
												>
													<TimePicker
														disabledTime={() => {
															return {
																disabledSeconds: () => Array.from({ length: 59 }, (_, i) => i + 1),
															};
														}}
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
							title="同步联系人设置"
							style={{ marginTop: 24 }}
						>
							<Form.Item
								name="friend_sync_cron"
								label="同步周期"
							>
								<InputNumber
									disabled
									addonBefore={'每隔'}
									addonAfter={'小时同步一次'}
									min={0.2}
									max={20}
									precision={1}
								/>
							</Form.Item>
						</ParamsGroup>
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
		</div>
	);
};

export default React.memo(GlobalSettings);
