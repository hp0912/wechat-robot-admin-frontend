import { InboxOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { App, Avatar, Button, Col, Flex, Input, Modal, Progress, Row, Select, Space, Upload } from 'antd';
import type { GetProp, UploadFile, UploadProps } from 'antd';
import axios from 'axios';
import React, { useState } from 'react';
import SparkMD5 from 'spark-md5';
import type { Api } from '@/api/wechat-robot/wechat-robot';
import { filterOption } from '@/common/filter-option';
import { maxTagPlaceholder } from '@/common/maxTagPlaceholder';
import { DefaultAvatar } from '@/constant';
import { EMessageType, type StoredUploadMeta } from './types';

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

interface IProps {
	open: boolean;
	robotId: number;
	robot: Api.V1RobotViewList.ResponseBody['data'];
	contact: Api.V1ContactListList.ResponseBody['data']['items'][number];
	onClose: () => void;
}

const CHUNK_SIZE = 50000; // 文件分片上传的分片大小

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
	// 文件分片上传相关
	const [fileUploading, setFileUploading] = useState(false);
	const [computingHash, setComputingHash] = useState(false);
	const [fileHash, setFileHash] = useState<string | undefined>();

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
			const resp = await axios.post(path, formData, {
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
			if (resp.data.code !== 200) {
				throw new Error(resp.data.message || '发送失败');
			}
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

	// 分片发送普通文件（非图片/视频/音频）
	// 计算文件哈希 (MD5)，用于去重与断点续传标识
	const computeFileHash = async (file: File): Promise<string> => {
		setComputingHash(true);
		try {
			// 增量读取，避免一次性加载超大文件
			const chunkSize = 2 * 1024 * 1024; // 2MB 计算哈希分片（独立于上传分片，可更大减少开销）
			const spark = new SparkMD5.ArrayBuffer();
			let offset = 0;
			while (offset < file.size) {
				const slice = file.slice(offset, offset + chunkSize);
				const buf = await slice.arrayBuffer();
				spark.append(buf);
				offset += chunkSize;
			}
			return spark.end();
		} finally {
			setComputingHash(false);
		}
	};

	const buildStorageKey = (hash: string, file: File) =>
		`file_upload_${props.robotId}_${props.contact.wechat_id}_${hash}_${file.size}_${file.name}`;

	const loadMeta = (key: string): StoredUploadMeta | undefined => {
		try {
			const raw = localStorage.getItem(key);
			if (!raw) return undefined;
			return JSON.parse(raw) as StoredUploadMeta;
		} catch {
			return undefined;
		}
	};

	const saveMeta = (key: string, meta: StoredUploadMeta) => {
		try {
			localStorage.setItem(key, JSON.stringify(meta));
		} catch {
			// ignore quota errors
		}
	};

	const removeMeta = (key: string) => {
		try {
			localStorage.removeItem(key);
		} catch {
			// ignore quota errors
		}
	};

	const sendFileInChunks = async () => {
		if (!attach) return;
		const file = attach as FileType;
		const clientAppDataId = `${props.robot.wechat_id}_${Math.floor(Date.now() / 1000)}_UploadFile`;
		setFileUploading(true);
		try {
			// 1. Hash
			const hash = fileHash || (await computeFileHash(file));
			setFileHash(hash);
			const storageKey = buildStorageKey(hash, file);
			const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
			let meta = loadMeta(storageKey);
			// 初始化或校验 meta
			if (!meta || meta.totalChunks !== totalChunks || meta.fileSize !== file.size) {
				meta = {
					completed: false,
					clientAppDataId,
					lastChunk: -1,
					totalChunks,
					fileName: file.name,
					fileSize: file.size,
					updatedAt: Date.now(),
				};
				saveMeta(storageKey, meta);
			}
			// 2. 断点：从 lastChunk+1 继续
			const startIndex = meta.lastChunk + 1;
			setPercent(Math.round(((meta.lastChunk + 1) / totalChunks) * 100));
			for (let index = startIndex; index < totalChunks; index++) {
				const start = index * CHUNK_SIZE;
				const end = Math.min(start + CHUNK_SIZE, file.size);
				const blob = file.slice(start, end);
				const formData = new FormData();
				formData.append('id', props.robotId.toString());
				formData.append('to_wxid', props.contact.wechat_id!);
				formData.append('client_app_data_id', meta.clientAppDataId);
				formData.append('filename', file.name);
				formData.append('file_hash', hash);
				formData.append('file_size', file.size.toString());
				formData.append('chunk_index', index.toString());
				formData.append('total_chunks', totalChunks.toString());
				formData.append('chunk', blob, file.name + '.part' + index);
				const resp = await axios.post<{ code: number; message: string }>(
					'/api/v1/message/send/file?id=' + props.robotId,
					formData,
					{
						headers: { 'Content-Type': 'multipart/form-data' },
					},
				);
				if (resp.data.code !== 200) {
					throw new Error(resp.data.message);
				}
				meta.lastChunk = index;
				meta.updatedAt = Date.now();
				saveMeta(storageKey, meta);
				setPercent(Math.round(((index + 1) / totalChunks) * 100));
			}
			meta.completed = true;
			meta.updatedAt = Date.now();
			removeMeta(storageKey);
			message.success('发送成功');
			setAttach(undefined);
		} catch (ex: unknown) {
			if (ex instanceof Error) {
				modal.error({ title: '发送失败', content: ex.message || '未知错误' });
			}
		} finally {
			setFileUploading(false);
			setPercent(0);
		}
	};

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
				return (
					<React.Fragment key="file">
						<Upload.Dragger
							name="file"
							maxCount={1}
							multiple={false}
							// 不限制 accept，让用户可选所有，再在 beforeUpload 中排除图片/视频/音频
							beforeUpload={file => {
								const forbiddenPrefixes = ['image/', 'video/', 'audio/'];
								if (forbiddenPrefixes.some(p => file.type.startsWith(p))) {
									message.error('图片、视频、音频类型文件请选择对应的发送方式，不要通过文件方式发送');
									return Upload.LIST_IGNORE;
								}
								setAttach(file);
								return false; // 手动上传
							}}
							onRemove={() => {
								setAttach(undefined);
							}}
						>
							<p className="ant-upload-drag-icon">
								<InboxOutlined />
							</p>
							<p className="ant-upload-text">单击或将文件拖到此区域进行上传</p>
							<p className="ant-upload-hint">
								支持断点续传，图片/视频/音频类型请使用对应的发送方式，不要通过文件方式发送
							</p>
						</Upload.Dragger>
						{(fileUploading || computingHash || percent > 0) && (
							<Progress
								percent={computingHash ? 0 : percent}
								status={computingHash ? 'active' : percent >= 100 && fileUploading ? 'active' : undefined}
							/>
						)}
					</React.Fragment>
				);
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
		if (messageType === EMessageType.File) {
			return attach === undefined || fileUploading;
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
			if (messageType === EMessageType.File) {
				await sendFileInChunks();
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
							{ label: '文件消息', value: EMessageType.File },
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
