import { QuestionCircleOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { App, Button, Form, InputNumber, Modal, Select, Space, Spin, Switch, Tooltip } from 'antd';
import React from 'react';
import type { Api } from '@/api/wechat-robot/wechat-robot';

interface IProps {
	robotId: number;
	chatRoomId: string;
	chatRoomName: string;
	chatRoomMemberId: string;
	chatRoomMemberName: string;
	open: boolean;
	onRefresh: () => void;
	onClose: () => void;
}

const ChatRoomMemberSettings = (props: IProps) => {
	const { message } = App.useApp();

	const [form] = Form.useForm<Api.V1ChatRoomMemberCreate.RequestBody>();

	const { data, loading } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1ChatRoomMemberList({
				id: props.robotId,
				chat_room_id: props.chatRoomId,
				wechat_id: props.chatRoomMemberId,
			});
			return resp.data?.data;
		},
		{
			manual: false,
			onSuccess: resp => {
				if (resp) {
					form.setFieldsValue({
						is_admin: resp.is_admin,
						is_blacklisted: resp.is_blacklisted,
					});
				}
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	const { runAsync: onSave, loading: saveLoading } = useRequest(
		async (values: Api.V1ChatRoomMemberCreate.RequestBody) => {
			const resp = await window.wechatRobotClient.api.v1ChatRoomMemberCreate(
				{
					id: props.robotId,
				},
				values,
			);
			return resp?.data?.data;
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

	return (
		<Modal
			title={`${props.chatRoomName} / ${props.chatRoomMemberName} - 成员设置`}
			width={650}
			open={props.open}
			onCancel={props.onClose}
			footer={[
				<Button
					key="cancel"
					onClick={props.onClose}
				>
					取消
				</Button>,
				<Button
					key="batch"
					type="primary"
					ghost
					loading={saveLoading}
					icon={
						<Tooltip title="为每个群的这个成员设置相同的配置">
							<QuestionCircleOutlined />
						</Tooltip>
					}
					iconPlacement="end"
					onClick={async () => {
						const values = await form.validateFields();
						values.chat_room_id = props.chatRoomId;
						values.wechat_id = props.chatRoomMemberId;
						values.batch = true;
						await onSave(values);
						props.onRefresh();
						props.onClose();
					}}
				>
					批量设置
				</Button>,
				<Button
					key="ok"
					type="primary"
					loading={saveLoading}
					onClick={async () => {
						const values = await form.validateFields();
						values.chat_room_id = props.chatRoomId;
						values.wechat_id = props.chatRoomMemberId;
						values.batch = false;
						await onSave(values);
						props.onRefresh();
						props.onClose();
					}}
				>
					保存
				</Button>,
			]}
		>
			<Spin spinning={loading}>
				<Form
					form={form}
					labelCol={{ flex: '0 0 90px' }}
					wrapperCol={{ flex: '1 1 auto' }}
					autoComplete="off"
				>
					<Form.Item
						name="is_admin"
						label="管理员"
						valuePropName="checked"
						tooltip="管理员可以使用专有管理员指令"
					>
						<Switch
							checkedChildren="是"
							unCheckedChildren="否"
						/>
					</Form.Item>
					<Form.Item
						name="is_blacklisted"
						label="黑名单"
						valuePropName="checked"
						tooltip="设置为黑名单后，不会触发任何机器人交互"
					>
						<Switch
							checkedChildren="是"
							unCheckedChildren="否"
						/>
					</Form.Item>
					<Form.Item
						label="临时积分"
						tooltip="临时积分当天有效，次日清零"
						help={`当前临时积分: ${data?.temporary_score || 0}，为用户增加/减少临时积分，不是修改临时积分余额`}
					>
						<Space.Compact style={{ width: '100%' }}>
							<Form.Item
								name="temporary_score_action"
								initialValue="increase"
								noStyle
							>
								<Select
									style={{ width: '100px' }}
									options={[
										{ label: '增加', value: 'increase' },
										{ label: '减少', value: 'reduce' },
									]}
								/>
							</Form.Item>
							<Form.Item
								name="temporary_score"
								noStyle
							>
								<InputNumber
									style={{ width: 'calc(100% - 100px)' }}
									min={0}
									max={500000}
									precision={0}
								/>
							</Form.Item>
						</Space.Compact>
					</Form.Item>
					<Form.Item
						label="积分"
						tooltip="积分累计，不会清零"
						help={`当前积分: ${data?.score || 0}，为用户增加/减少积分，不是修改积分余额`}
					>
						<Space.Compact style={{ width: '100%' }}>
							<Form.Item
								name="score_action"
								initialValue="increase"
								noStyle
							>
								<Select
									style={{ width: '100px' }}
									options={[
										{ label: '增加', value: 'increase' },
										{ label: '减少', value: 'reduce' },
									]}
								/>
							</Form.Item>
							<Form.Item
								name="score"
								noStyle
							>
								<InputNumber
									style={{ width: 'calc(100% - 100px)' }}
									min={0}
									max={500000}
									precision={0}
								/>
							</Form.Item>
						</Space.Compact>
					</Form.Item>
				</Form>
			</Spin>
		</Modal>
	);
};

export default React.memo(ChatRoomMemberSettings);
