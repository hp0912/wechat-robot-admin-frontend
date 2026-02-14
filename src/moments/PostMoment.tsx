import { FileImageOutlined, PlusOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { App, Avatar, Col, Form, Image, Input, Modal, Row, Segmented, Select, Spin, Upload } from 'antd';
import type { GetProp, UploadFile, UploadProps } from 'antd';
import axios from 'axios';
import React, { useState } from 'react';
import type { Api } from '@/api/wechat-robot/wechat-robot';
import { DefaultAvatar } from '@/constant';
import MentionOutlined from '@/icons/MentionOutlined';
import { UploadContainer } from './styled';

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

type IMomentBody = Api.V1MomentsPostCreate.RequestBody;

type IUploadMedia = Api.V1MomentsUploadMediaCreate.ResponseBody['data'];

interface ILabelInValue {
	value: string;
}

interface IFormValue {
	content?: string;
	media_type?: string;
	mention_with?: ILabelInValue[];
	share_type: string;
	share_with?: ILabelInValue[];
	donot_share?: ILabelInValue[];
}

interface IProps {
	open: boolean;
	robotId: number;
	robot: Api.V1RobotViewList.ResponseBody['data'];
	onRefresh: () => void;
	onClose: () => void;
}

const getBase64 = (file: FileType): Promise<string> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = error => reject(error);
	});
};

const PostMoment = (props: IProps) => {
	const { message } = App.useApp();

	const [form] = Form.useForm<IFormValue>();

	const [previewOpen, setPreviewOpen] = useState(false);
	const [previewImage, setPreviewImage] = useState('');
	const [mediaList, setMediaList] = useState<UploadFile[]>([]);
	const [mediaUploadTip, setMediaUploadTip] = useState('');
	const [postMomentLoading, setPostMomentLoading] = useState(false);

	const {
		data: contacts,
		runAsync: getContacts,
		loading: contactsLoading,
	} = useRequest(
		async (keyword = '') => {
			const resp = await window.wechatRobotClient.api.v1ContactListList({
				id: props.robotId,
				keyword,
				type: 'friend',
				page_index: 1,
				page_size: 20,
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

	const { runAsync: postMoment } = useRequest(
		async (moment: IMomentBody) => {
			const resp = await window.wechatRobotClient.api.v1MomentsPostCreate(moment, {
				id: props.robotId,
			});
			return resp.data;
		},
		{
			manual: true,
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	const onPreview = async (file: UploadFile) => {
		if (!file.url && !file.preview) {
			file.preview = await getBase64(file as FileType);
		}
		setPreviewImage(file.url || (file.preview as string));
		setPreviewOpen(true);
	};

	const mediaUpload = async (media: UploadFile): Promise<IUploadMedia> => {
		try {
			const formData = new FormData();
			await new Promise<void>((resolve, reject) => {
				const reader = new FileReader();
				reader.readAsDataURL((media as FileType).slice(0, 1));
				reader.onerror = () => {
					reject(new Error('文件读取失败，请检查文件是否被删除、被移动位置或被修改，请尝试重新选择文件。'));
				};
				reader.onload = async () => {
					resolve();
				};
			});
			formData.append('media', media as FileType);
			formData.append('id', props.robotId.toString());
			const resp = await axios.post('/api/v1/moments/upload-media?id=' + props.robotId, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});
			if (resp.data.code !== 200) {
				throw new Error(resp.data.message || '上传失败');
			}
			return resp.data.data as IUploadMedia;
		} catch (error) {
			setMediaUploadTip('');
			if (error instanceof Error) {
				message.error(error.message);
			}
			throw error;
		}
	};

	const getContactSelect = (placeholder: React.ReactNode) => {
		return (
			<Select
				labelInValue
				showSearch={{
					filterOption: false,
					onSearch: value => {
						getContacts(value);
					},
				}}
				loading={contactsLoading}
				mode="multiple"
				placeholder={placeholder}
				options={contacts?.items
					?.filter(contact => {
						return contact.wechat_id !== props.robot.wechat_id;
					})
					?.map(contact => {
						return {
							label: (
								<Row
									align="middle"
									wrap={false}
								>
									<Col flex="0 0 auto">
										<Avatar
											size="small"
											src={contact.avatar || DefaultAvatar}
										/>
									</Col>
									<Col flex="1 1 auto">{contact.remark || contact.nickname || contact.alias || contact.wechat_id}</Col>
								</Row>
							),
							value: contact.wechat_id,
						};
					})}
			/>
		);
	};

	return (
		<Modal
			title="发布朋友圈"
			width="min(550px, calc(100vw - 32px))"
			open={props.open}
			confirmLoading={postMomentLoading}
			onOk={async () => {
				try {
					setPostMomentLoading(true);

					const values = await form.validateFields();
					const medias: IUploadMedia[] = [];
					// 上传图片/视频
					if (mediaList?.length) {
						let mediaIndex = 0;
						for (const mediaItem of mediaList) {
							setMediaUploadTip(
								`正在上传第 ${mediaIndex + 1} ${values.media_type === 'video' ? '个视频' : '张图片'}...`,
							);
							const media = await mediaUpload(mediaItem);
							medias.push(media);
							mediaIndex++;
						}
					}
					await postMoment({
						id: props.robotId,
						content: values.content,
						media_list: medias,
						with_user_list: (values.mention_with || []).map(item => item.value),
						share_type: values.share_type,
						share_with: (values.share_with || []).map(item => item.value),
						donot_share: (values.donot_share || []).map(item => item.value),
					});

					message.success('朋友圈发布成功');
					props.onRefresh();
					props.onClose();
				} finally {
					setPostMomentLoading(false);
					setMediaUploadTip('');
				}
			}}
			onCancel={props.onClose}
		>
			<Form
				form={form}
				labelCol={{ flex: '0 0 110px' }}
				wrapperCol={{ flex: '1 1 auto' }}
				autoComplete="off"
			>
				<Form.Item
					name="content"
					rules={[{ max: 2000, message: '朋友圈内容不能超过2000个字符' }]}
				>
					<Input.TextArea
						rows={5}
						placeholder="说点什么吧..."
						allowClear
					/>
				</Form.Item>
				<Spin
					spinning={mediaUploadTip !== ''}
					tip={mediaUploadTip}
				>
					<Form.Item
						name="media_type"
						initialValue="image"
					>
						<Segmented
							shape="round"
							options={[
								{ value: 'image', label: '图片', icon: <FileImageOutlined /> },
								{ value: 'video', label: '视频', icon: <VideoCameraOutlined /> },
							]}
							onChange={() => {
								setMediaList([]);
							}}
						/>
					</Form.Item>
					<Form.Item
						noStyle
						shouldUpdate={(prevValues: IFormValue, nextValues: IFormValue) =>
							prevValues.media_type !== nextValues.media_type
						}
					>
						{({ getFieldValue }) => {
							const mediaType = getFieldValue('media_type');
							if (mediaType === 'video') {
								return (
									<UploadContainer>
										<Upload
											listType="picture-card"
											fileList={mediaList}
											onPreview={onPreview}
											accept=".mp4,.mov,.avi,.mkv,.flv,.webm"
											beforeUpload={async file => {
												setMediaList([...mediaList, file]);
												return false;
											}}
											onRemove={file => {
												const index = mediaList.indexOf(file);
												const newFileList = mediaList.slice();
												newFileList.splice(index, 1);
												setMediaList(newFileList);
											}}
										>
											{/* 视频只能上传一个 */}
											{mediaList.length >= 1 ? null : <PlusOutlined style={{ fontSize: 28 }} />}
										</Upload>
									</UploadContainer>
								);
							}
							if (mediaType === 'image') {
								return (
									<UploadContainer>
										<Upload
											listType="picture-card"
											fileList={mediaList}
											onPreview={onPreview}
											accept=".jpg,.jpeg,.png,.gif,.webp"
											beforeUpload={async file => {
												const uploadFile = file as UploadFile;
												if (!uploadFile.thumbUrl) {
													uploadFile.thumbUrl = await getBase64(file);
												}
												setMediaList([...mediaList, uploadFile]);
												return false;
											}}
											onRemove={file => {
												const index = mediaList.indexOf(file);
												const newFileList = mediaList.slice();
												newFileList.splice(index, 1);
												setMediaList(newFileList);
											}}
										>
											{/* 图片只能上传9个 */}
											{mediaList.length >= 9 ? null : <PlusOutlined style={{ fontSize: 28 }} />}
										</Upload>
									</UploadContainer>
								);
							}
							return null;
						}}
					</Form.Item>
				</Spin>
				<Form.Item
					name="mention"
					initialValue="mention"
				>
					<Segmented
						shape="round"
						options={[{ value: 'mention', label: '提醒谁看', icon: <MentionOutlined /> }]}
					/>
				</Form.Item>
				<Form.Item name="mention_with">{getContactSelect('请选择提醒好友')}</Form.Item>
				<Form.Item
					name="share_type"
					initialValue="public"
				>
					<Segmented
						shape="round"
						options={[
							{ value: 'public', label: '公开' },
							{ value: 'private', label: '隐私' },
							{ value: 'share_with', label: '部分可见' },
							{ value: 'donot_share', label: '不给谁看' },
						]}
					/>
				</Form.Item>
				<Form.Item
					noStyle
					shouldUpdate={(preValues: { share_type: string }, nextValues: { share_type: string }) => {
						return preValues.share_type !== nextValues.share_type;
					}}
				>
					{({ getFieldValue }) => {
						const shareType = getFieldValue('share_type');
						if (shareType === 'share_with') {
							return (
								<Form.Item
									name="share_with"
									rules={[{ required: true, message: '请选择分享好友' }]}
								>
									{getContactSelect('请选择分享好友')}
								</Form.Item>
							);
						}
						if (shareType === 'donot_share') {
							return (
								<Form.Item
									name="donot_share"
									rules={[{ required: true, message: '请选择不给看的好友' }]}
								>
									{getContactSelect('请选择不给看的好友')}
								</Form.Item>
							);
						}
						return null;
					}}
				</Form.Item>
				{!!previewImage && (
					<Image
						styles={{
							root: { display: 'none' },
						}}
						preview={{
							visible: previewOpen,
							onVisibleChange: visible => setPreviewOpen(visible),
							afterOpenChange: visible => !visible && setPreviewImage(''),
						}}
						src={previewImage}
					/>
				)}
			</Form>
		</Modal>
	);
};

export default React.memo(PostMoment);
