import { useRequest } from 'ahooks';
import {
	Alert,
	App,
	AutoComplete,
	Avatar,
	Col,
	Form,
	Input,
	InputNumber,
	Modal,
	Row,
	Select,
	Spin,
	Switch,
} from 'antd';
import React, { useContext } from 'react';
import type { Api } from '@/api/wechat-robot/wechat-robot';
import { filterOption } from '@/common/filter-option';
import { DefaultAvatar } from '@/constant';
import { AiModels } from '@/constant/ai';
import { GlobalContext } from '@/context/global';

interface IProps {
	open?: boolean;
	robotId: number;
	onClose: () => void;
}

interface IFormValue extends Api.V1MomentsSettingsCreate.RequestBody {
	whitelist_contacts?: string[];
	blacklist_contacts?: string[];
}

const MomentSettings = (props: IProps) => {
	const { message } = App.useApp();

	const globalContext = useContext(GlobalContext);

	const [form] = Form.useForm<IFormValue>();

	const { data: contacts, loading: contactLoading } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1ContactListList({
				id: props.robotId,
				type: 'friend',
				page_index: 1,
				page_size: 10000,
			});
			return resp.data?.data;
		},
		{
			manual: false,
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	const { loading } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1MomentsSettingsList({
				id: props.robotId,
			});
			return resp.data?.data;
		},
		{
			manual: false,
			onSuccess: data => {
				if (data) {
					const formData: IFormValue = { ...data };
					if (data.whitelist) {
						formData.whitelist_contacts = data.whitelist.split(',').filter(Boolean);
					}
					if (data.blacklist) {
						formData.blacklist_contacts = data.blacklist.split(',').filter(Boolean);
					}
					form.setFieldsValue(formData);
				}
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	const { runAsync: onSave, loading: saveLoading } = useRequest(
		async (data: IFormValue) => {
			data.whitelist = data.whitelist_contacts?.join(',') || '';
			data.blacklist = data.blacklist_contacts?.join(',') || '';
			if (!data.id) {
				data.id = 0;
			}
			delete data.whitelist_contacts;
			delete data.blacklist_contacts;
			const resp = await window.wechatRobotClient.api.v1MomentsSettingsCreate(data, {
				id: props.robotId,
			});
			return resp.data?.data;
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

	return (
		<Modal
			title="朋友圈设置"
			width={globalContext.global?.isSmallScreen ? '100%' : 760}
			open={props.open}
			confirmLoading={saveLoading}
			onOk={async () => {
				const values = await form.validateFields();
				onSave({ ...values });
			}}
			onCancel={props.onClose}
		>
			<Spin spinning={loading}>
				<Form
					form={form}
					labelCol={{ flex: '0 0 125px' }}
					wrapperCol={{ flex: '1 1 auto' }}
					autoComplete="off"
				>
					<Alert
						style={{ marginBottom: 16 }}
						message="AI不会对朋友圈图片进行识别，因此，为了防止【别人发了一张讣告图片而点赞】这类情况的发生，当图片内容少于3张且没有文字内容时，AI会跳过处理这条朋友圈。"
						type="warning"
						showIcon
					/>
					<Form.Item
						name="id"
						hidden
					>
						<Input />
					</Form.Item>
					<Form.Item
						name="auto_like"
						label="自动点赞"
						valuePropName="checked"
					>
						<Switch
							unCheckedChildren="关闭"
							checkedChildren="开启"
						/>
					</Form.Item>
					<Form.Item
						name="auto_comment"
						label="自动评论"
						valuePropName="checked"
					>
						<Switch
							unCheckedChildren="关闭"
							checkedChildren="开启"
						/>
					</Form.Item>
					<Form.Item
						name="whitelist_contacts"
						label="白名单"
						help="白名单: 只给谁点赞、评论，如果设置了白名单，会自动忽略黑名单设置"
					>
						<Select
							style={{ width: '100%' }}
							placeholder="选择联系人"
							mode="multiple"
							maxTagCount="responsive"
							showSearch
							allowClear
							loading={contactLoading}
							filterOption={filterOption}
							options={(contacts?.items || []).map(item => {
								const labelText = item.remark || item.nickname || item.alias || item.wechat_id;
								return {
									label: (
										<Row
											align="middle"
											wrap={false}
											gutter={3}
										>
											<Col flex="0 0 auto">
												<Avatar
													src={item.avatar || DefaultAvatar}
													gap={0}
													size={18}
												/>
											</Col>
											<Col
												flex="1 1 auto"
												className="ellipsis"
											>
												{labelText}
											</Col>
										</Row>
									),
									value: item.wechat_id,
									text: `${item.remark || ''} ${item.nickname || ''} ${item.alias || ''} ${item.wechat_id}`,
								};
							})}
						/>
					</Form.Item>
					<Form.Item
						name="blacklist_contacts"
						label="黑名单"
						help="黑名单: 不给谁点赞、评论，如果设置了白名单，会自动忽略黑名单设置"
					>
						<Select
							style={{ width: '100%' }}
							placeholder="选择联系人"
							mode="multiple"
							maxTagCount="responsive"
							showSearch
							allowClear
							loading={contactLoading}
							filterOption={filterOption}
							options={(contacts?.items || []).map(item => {
								const labelText = item.remark || item.nickname || item.alias || item.wechat_id;
								return {
									label: (
										<Row
											align="middle"
											wrap={false}
											gutter={3}
										>
											<Col flex="0 0 auto">
												<Avatar
													src={item.avatar || DefaultAvatar}
													gap={0}
													size={18}
												/>
											</Col>
											<Col
												flex="1 1 auto"
												className="ellipsis"
											>
												{labelText}
											</Col>
										</Row>
									),
									value: item.wechat_id,
									text: `${item.remark || ''} ${item.nickname || ''} ${item.alias || ''} ${item.wechat_id}`,
								};
							})}
						/>
					</Form.Item>
					<Form.Item
						name="ai_base_url"
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
						name="ai_api_key"
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
						name="workflow_model"
						label="工作流模型"
						rules={[{ required: true, message: '工作流模型不能为空' }]}
						tooltip={
							<>
								<p>
									工作流模型是用来在点赞、评论前用来判断朋友圈内容是否适合点赞、评论的，比如出现天灾人祸时就不适合点赞。
								</p>
								<p>
									工作流模型必须支持JSON
									Schema结构化输出，性能不用太好，追求速度快，推荐使用gpt-4o-mini或者gpt-4.1-mini。
								</p>
							</>
						}
					>
						<AutoComplete
							placeholder="请选择或者手动输入工作流模型"
							style={{ width: '100%' }}
							options={AiModels}
						/>
					</Form.Item>
					<Form.Item
						name="comment_model"
						label="评论模型"
						rules={[{ required: true, message: '评论模型不能为空' }]}
						tooltip={<>用来对朋友圈内容发表评论</>}
					>
						<AutoComplete
							placeholder="请选择或者手动输入评论模型"
							style={{ width: '100%' }}
							options={AiModels}
						/>
					</Form.Item>
					<Form.Item
						name="comment_prompt"
						label="评论提示词"
						rules={[{ required: true, message: '评论提示词不能为空' }]}
						tooltip="评论提示词是指在评论朋友圈时，系统会自动添加的提示信息，用于引导AI的回答方向和风格。"
					>
						<Input.TextArea
							rows={3}
							placeholder="请输入评论提示词"
							allowClear
						/>
					</Form.Item>
					<Form.Item
						name="max_completion_tokens"
						label="最大评论字数"
						rules={[{ required: true, message: '最大评论字数不能为空' }]}
						tooltip="最大评论字数是指AI生成的评论内容的最大字数限制，0表示不限制。"
					>
						<InputNumber
							placeholder="请输入最大评论字数，为0则表示不限制"
							style={{ width: '100%' }}
							max={4096}
							min={0}
						/>
					</Form.Item>
				</Form>
			</Spin>
		</Modal>
	);
};

export default React.memo(MomentSettings);
