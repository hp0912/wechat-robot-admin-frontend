import { useRequest } from 'ahooks';
import { App, Avatar, Button, Col, Form, Input, Modal, Row, Tooltip } from 'antd';
import React, { useContext } from 'react';
import type { Api } from '@/api/wechat-robot/wechat-robot';
import { DefaultAvatar } from '@/constant';
import { GlobalContext } from '@/context/global';

interface IProps {
	robotId: number;
	robot: Api.V1RobotViewList.ResponseBody['data'];
	open: boolean;
	onRefresh?: () => void;
	onClose: () => void;
}

const SearchFriends = (props: IProps) => {
	const { message } = App.useApp();

	const globalContext = useContext(GlobalContext);

	const [form] = Form.useForm<{ username: string; verify_content: string }>();

	// 搜索好友
	const {
		runAsync: search,
		data,
		loading,
	} = useRequest(
		async (username: string) => {
			const resp = await window.wechatRobotClient.api.v1ContactFriendSearchCreate(
				{
					id: props.robotId,
					to_username: username,
				},
				{
					id: props.robotId,
				},
			);
			return resp.data?.data;
		},
		{
			manual: true,
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	// 添加好友
	const { runAsync: addFriend, loading: addLoading } = useRequest(
		async (verifyContent: string) => {
			const resp = await window.wechatRobotClient.api.v1ContactFriendAddCreate(
				{
					id: props.robotId,
					v1: data?.username || '',
					v2: data?.antispam_ticket || '',
					verify_content: verifyContent,
				},
				{ id: props.robotId },
			);
			await new Promise(resolve => setTimeout(resolve, 6000)); // 等待6秒，确保群聊创建成功
			return resp.data?.data;
		},
		{
			manual: true,
			onSuccess: () => {
				message.success('你已经成功添加好友');
				props.onRefresh?.();
				props.onClose();
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	return (
		<Modal
			title="添加好友"
			width={globalContext.global?.isSmallScreen ? '100%' : 450}
			open={props.open}
			onCancel={props.onClose}
			footer={[
				<Button
					key="cancel"
					onClick={props.onClose}
				>
					取消
				</Button>,
				<Tooltip
					key="ok"
					title={!data?.username ? '请先搜索好友' : undefined}
				>
					<Button
						type="primary"
						disabled={loading || !data?.username}
						loading={addLoading}
						onClick={async () => {
							if (!data?.username) {
								message.warning('请先搜索好友');
								return;
							}
							const values = await form.validateFields();
							await addFriend(values.verify_content);
						}}
					>
						添加
					</Button>
				</Tooltip>,
			]}
		>
			<Form
				form={form}
				labelCol={{ flex: '0 0 115px' }}
				wrapperCol={{ flex: '1 1 auto' }}
				autoComplete="off"
			>
				<Form.Item
					name="username"
					label="微信号/手机号"
					rules={[{ required: true, message: '请输入微信号/手机号' }]}
				>
					<Input.Search
						placeholder="请输入微信号/手机号"
						onSearch={value => {
							if (value?.trim()) {
								search(value.trim());
							}
						}}
						enterButton
					/>
				</Form.Item>
				{!!data?.username && (
					<Form.Item label="搜索结果">
						<Row>
							<Col flex="0 0 28px">
								<Avatar
									size="small"
									src={data.avatar || DefaultAvatar}
								/>
							</Col>
							<Col
								flex="1 1 auto"
								style={{ marginLeft: 8 }}
							>
								<div style={{ lineHeight: '28px' }}>{data.nickname}</div>
							</Col>
						</Row>
					</Form.Item>
				)}
				<Form.Item
					name="verify_content"
					label="好友验证信息"
					rules={[
						{ required: true, message: '请输入好友验证信息' },
						{ max: 100, message: '好友验证信息不能超过100个字符' },
					]}
				>
					<Input.TextArea
						rows={5}
						placeholder="请输入好友验证信息"
						allowClear
					/>
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default React.memo(SearchFriends);
