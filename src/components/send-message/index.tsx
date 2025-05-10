import { useRequest } from 'ahooks';
import { App, Button, Flex, Input, Modal, Select, Space } from 'antd';
import React, { useState } from 'react';
import type { Api } from '@/api/wechat-robot/wechat-robot';
import { filterOption } from '@/common/filter-option';
import { maxTagPlaceholder } from '@/common/maxTagPlaceholder';

interface IProps {
	open: boolean;
	robotId: number;
	robot: Api.V1RobotViewList.ResponseBody['data'];
	contactId: string;
	onClose: () => void;
}

enum EMessageType {
	Text = 'text',
	Image = 'image',
	Video = 'video',
	Voice = 'voice',
	File = 'file',
}

const SendMessage = (props: IProps) => {
	const { message } = App.useApp();

	const [submitLoading, setSubmitLoading] = useState(false);
	const [messageType, setMessageType] = useState<EMessageType>(EMessageType.Text);
	const [textMessageContent, setTextMessageContent] = useState('');
	const [mentions, setMentions] = useState<string[]>([]);

	const { data, loading } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1ChatRoomMembersList({
				id: props.robotId,
				chat_room_id: props.contactId,
				page_index: 1,
				page_size: 500,
			});
			// 去掉自己
			return resp.data?.data?.items.filter(item => item.wechat_id !== props.robot.wechat_id) || [];
		},
		{
			manual: false,
			ready: props.contactId?.endsWith('@chatroom'),
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	const { runAsync: sendTextMessage } = useRequest(
		async () => {
			await window.wechatRobotClient.api.v1MessageSendTextCreate(
				{ id: props.robotId },
				{
					id: props.robotId,
					to_wxid: props.contactId,
					content: textMessageContent,
					at: mentions,
				},
			);
		},
		{
			manual: true,
			onSuccess: () => {
				message.success('发送成功');
				setTextMessageContent('');
				setMentions([]);
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	const getContent = () => {
		switch (messageType) {
			case EMessageType.Text:
				return (
					<Input.TextArea
						placeholder="请输入消息内容"
						rows={4}
						value={textMessageContent}
						onChange={ev => {
							setTextMessageContent(ev.target.value);
						}}
					/>
				);
			case EMessageType.Image:
				return <div>图片消息</div>;
			case EMessageType.Video:
				return <div>视频消息</div>;
			case EMessageType.Voice:
				return <div>语音消息</div>;
			case EMessageType.File:
				return <div>文件消息</div>;
			default:
				return null;
		}
	};

	const isSendButtonDisabled = () => {
		if (messageType === EMessageType.Text) {
			return !textMessageContent;
		}
		return false;
	};

	const onSend = async () => {
		setSubmitLoading(true);
		try {
			if (messageType === EMessageType.Text) {
				await sendTextMessage();
			}
		} finally {
			setSubmitLoading(false);
		}
	};

	return (
		<Modal
			title="发送消息"
			open={props.open}
			onCancel={props.onClose}
			footer={null}
		>
			{getContent()}
			<Flex
				justify="end"
				align="center"
				style={{ marginTop: 12 }}
			>
				<Space>
					<Select
						value={messageType}
						options={[
							{ label: '文本消息', value: EMessageType.Text },
							{ label: '图片消息', value: EMessageType.Image },
							{ label: '视频消息', value: EMessageType.Video },
							{ label: '语音消息', value: EMessageType.Voice },
							{ label: '文件消息', value: EMessageType.File },
						]}
						onChange={value => {
							setMessageType(value);
						}}
					/>
					{messageType === EMessageType.Text && (
						<Select
							style={{ width: 150 }}
							mode="multiple"
							placeholder="选择@对象"
							showSearch
							allowClear
							loading={loading}
							maxTagCount="responsive"
							maxTagPlaceholder={maxTagPlaceholder}
							filterOption={filterOption}
							options={(data || []).map(item => {
								const labelText = item.nickname || item.alias || item.wechat_id;
								return {
									label: labelText,
									value: item.wechat_id,
									text: `${item.nickname || ''} ${item.alias || ''} ${item.wechat_id}`,
								};
							})}
							value={mentions}
							onChange={value => {
								setMentions(value);
							}}
						/>
					)}
					<Button
						type="primary"
						loading={submitLoading}
						disabled={isSendButtonDisabled()}
						onClick={onSend}
					>
						发送
					</Button>
				</Space>
			</Flex>
		</Modal>
	);
};

export default React.memo(SendMessage);
