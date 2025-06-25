import { InboxOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { App, Avatar, Button, Col, Flex, Input, Modal, Progress, Row, Select, Space, Upload } from 'antd';
import type { GetProp, UploadFile, UploadProps } from 'antd';
import axios from 'axios';
import React, { useState } from 'react';
import type { Api } from '@/api/wechat-robot/wechat-robot';
import { filterOption } from '@/common/filter-option';
import { maxTagPlaceholder } from '@/common/maxTagPlaceholder';
import { DefaultAvatar } from '@/constant';

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

interface IProps {
	open: boolean;
	robotId: number;
	robot: Api.V1RobotViewList.ResponseBody['data'];
	contact: Api.V1ContactListList.ResponseBody['data']['items'][number];
	onClose: () => void;
}

enum EMessageType {
	Text = 'text',
	Image = 'image',
	Video = 'video',
	Voice = 'voice',
	AITTS = 'aitts',
	File = 'file',
}

const SendMessage = (props: IProps) => {
	const { message, modal } = App.useApp();

	const [submitLoading, setSubmitLoading] = useState(false);
	const [messageType, setMessageType] = useState<EMessageType>(EMessageType.Text);
	const [textMessageContent, setTextMessageContent] = useState('');
	const [mentions, setMentions] = useState<string[]>([]);
	const [speaker, setSpeaker] = useState<string>();
	// 文件相关
	const [attach, setAttach] = useState<UploadFile>();
	const [percent, setPercent] = useState(0);

	const { data, loading } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1ChatRoomMembersList({
				id: props.robotId,
				chat_room_id: props.contact.wechat_id,
				page_index: 1,
				page_size: 500,
			});
			// 去掉自己
			return resp.data?.data?.items.filter(item => item.wechat_id !== props.robot.wechat_id) || [];
		},
		{
			manual: false,
			ready: props.contact.wechat_id?.endsWith('@chatroom'),
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	const { data: timbres = [], loading: timbresLoading } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1MessageTimbreList({
				id: props.robotId,
			});
			return [...new Set(resp.data?.data || [])];
		},
		{
			manual: false,
			ready: messageType === EMessageType.AITTS,
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
					to_wxid: props.contact.wechat_id!,
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

	const { runAsync: sendAITTSMessage } = useRequest(
		async () => {
			await window.wechatRobotClient.api.v1MessageSendAiTtsCreate(
				{
					id: props.robotId,
					to_wxid: props.contact.wechat_id!,
					speaker: speaker || '',
					content: textMessageContent,
				},
				{ id: props.robotId },
			);
		},
		{
			manual: true,
			onSuccess: () => {
				message.success('发送成功');
				setTextMessageContent('');
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	const { runAsync: sendAttach, loading: sendAttachLoading } = useRequest(
		async (type: 'image' | 'video' | 'voice') => {
			const formData = new FormData();
			await new Promise<void>((resolve, reject) => {
				const reader = new FileReader();
				reader.readAsDataURL((attach as FileType).slice(0, 1));
				reader.onerror = () => {
					reject(new Error('文件读取失败，请检查文件是否被删除、被移动位置或被修改，请尝试重新选择文件。'));
				};
				reader.onload = async () => {
					resolve();
				};
			});

			formData.append(type, attach as FileType);
			formData.append('id', props.robotId.toString());
			formData.append('to_wxid', props.contact.wechat_id!);

			let path = '';
			switch (type) {
				case 'image':
					path = '/api/v1/message/send/image?id=' + props.robotId;
					break;
				case 'video':
					path = '/api/v1/message/send/video?id=' + props.robotId;
					break;
				case 'voice':
					path = '/api/v1/message/send/voice?id=' + props.robotId;
					break;
			}
			await axios.post(path, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
				onUploadProgress: progressEvent => {
					if (progressEvent.total) {
						const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
						setPercent(percentCompleted);
					}
				},
			});
		},
		{
			manual: true,
			onSuccess: () => {
				message.success('发送成功');
				setAttach(undefined);
				setPercent(0);
			},
			onError: reason => {
				setPercent(0);
				modal.error({
					title: '发送失败',
					content: reason.message,
				});
			},
		},
	);

	const getContent = () => {
		switch (messageType) {
			case EMessageType.Text:
			case EMessageType.AITTS:
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
				return (
					<React.Fragment key="image">
						<Upload.Dragger
							name="file"
							maxCount={1}
							multiple={false}
							accept=".jpg, .jpeg, .png, .gif, .webp"
							beforeUpload={file => {
								setAttach(file);
								return false;
							}}
							onRemove={() => {
								setAttach(undefined);
							}}
						>
							<p className="ant-upload-drag-icon">
								<InboxOutlined />
							</p>
							<p className="ant-upload-text">单击或将图片拖到此区域进行上传</p>
							<p className="ant-upload-hint">只支持单图片上传，不超过50M</p>
						</Upload.Dragger>
						{sendAttachLoading && (
							<Progress
								percent={percent}
								status={percent >= 100 ? undefined : 'active'}
							/>
						)}
					</React.Fragment>
				);
			case EMessageType.Video:
				return (
					<React.Fragment key="video">
						<Upload.Dragger
							name="file"
							maxCount={1}
							multiple={false}
							accept=".mp4, .avi, .mov, .mkv, .flv, .webm"
							beforeUpload={file => {
								setAttach(file);
								return false;
							}}
							onRemove={() => {
								setAttach(undefined);
							}}
						>
							<p className="ant-upload-drag-icon">
								<InboxOutlined />
							</p>
							<p className="ant-upload-text">单击或将视频拖到此区域进行上传</p>
							<p className="ant-upload-hint">只支持单视频上传，不超过50M</p>
						</Upload.Dragger>
						{sendAttachLoading && (
							<Progress
								percent={percent}
								status={percent >= 100 ? undefined : 'active'}
							/>
						)}
					</React.Fragment>
				);
			case EMessageType.Voice:
				return (
					<React.Fragment key="voice">
						<Upload.Dragger
							name="file"
							maxCount={1}
							multiple={false}
							accept=".amr, .mp3, .wav"
							beforeUpload={file => {
								setAttach(file);
								return false;
							}}
							onRemove={() => {
								setAttach(undefined);
							}}
						>
							<p className="ant-upload-drag-icon">
								<InboxOutlined />
							</p>
							<p className="ant-upload-text">单击或将语音文件拖到此区域进行上传</p>
							<p className="ant-upload-hint">只支持语音文件上传，不超过50M</p>
						</Upload.Dragger>
						{sendAttachLoading && (
							<Progress
								percent={percent}
								status={percent >= 100 ? undefined : 'active'}
							/>
						)}
					</React.Fragment>
				);
			case EMessageType.File:
				return null;
			default:
				return null;
		}
	};

	const isSendButtonDisabled = () => {
		if (messageType === EMessageType.Text) {
			return !textMessageContent;
		}
		if (messageType === EMessageType.AITTS) {
			return !textMessageContent || !speaker;
		}
		return attach === undefined;
	};

	const onSend = async () => {
		setSubmitLoading(true);
		try {
			if (messageType === EMessageType.Text) {
				await sendTextMessage();
			}
			if (messageType === EMessageType.AITTS) {
				await sendAITTSMessage();
			}
			if (messageType === EMessageType.Image) {
				await sendAttach('image');
			}
			if (messageType === EMessageType.Video) {
				await sendAttach('video');
			}
			if (messageType === EMessageType.Voice) {
				await sendAttach('voice');
			}
		} finally {
			setSubmitLoading(false);
		}
	};

	return (
		<Modal
			title={
				<>
					发送消息
					<span style={{ fontSize: 12, color: 'gray', marginLeft: 3 }}>
						({props.contact.remark || props.contact.nickname || props.contact.wechat_id})
					</span>
				</>
			}
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
						style={{ width: 155 }}
						disabled={sendAttachLoading}
						value={messageType}
						options={[
							{ label: '文本消息', value: EMessageType.Text },
							{ label: '图片消息', value: EMessageType.Image },
							{ label: '视频消息', value: EMessageType.Video },
							{ label: '语音消息', value: EMessageType.Voice },
							{ label: 'AI文本转语音消息', value: EMessageType.AITTS },
							{ label: '文件消息 (暂不支持)', value: EMessageType.File, disabled: true },
						]}
						onChange={value => {
							setMessageType(value);
							setAttach(undefined);
						}}
					/>
					{messageType === EMessageType.Text && (
						<Select
							style={{ width: 185 }}
							mode="multiple"
							placeholder="选择@对象"
							showSearch
							allowClear
							loading={loading}
							maxTagCount="responsive"
							maxTagPlaceholder={maxTagPlaceholder}
							filterOption={filterOption}
							options={(data || []).map(item => {
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
							value={mentions}
							onChange={value => {
								setMentions(value);
							}}
						/>
					)}
					{messageType === EMessageType.AITTS && (
						<Select
							style={{ width: 185 }}
							placeholder="选择音色"
							showSearch
							allowClear
							loading={timbresLoading}
							filterOption={filterOption}
							options={timbres.map(item => ({
								label: item,
								value: item,
								text: item,
							}))}
							value={speaker}
							onChange={value => {
								setSpeaker(value);
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
