import { FileImageOutlined, PlusOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { App, Avatar, Col, Form, Image, Input, Modal, Row, Segmented, Select, Upload } from 'antd';
import type { GetProp, UploadFile, UploadProps } from 'antd';
import React, { useContext, useState } from 'react';
import type { Api } from '@/api/wechat-robot/wechat-robot';
import { DefaultAvatar } from '@/constant';
import { GlobalContext } from '@/context/global';
import MentionOutlined from '@/icons/MentionOutlined';

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

type IMomentBody = Api.V1MomentsPostCreate.RequestBody;

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

	const globalContext = useContext(GlobalContext);

	const [form] = Form.useForm<IFormValue>();

	const [previewOpen, setPreviewOpen] = useState(false);
	const [previewImage, setPreviewImage] = useState('');
	const [mediaList, setMediaList] = useState<UploadFile[]>([]);

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

	const { runAsync: postMoment, loading: postMomentLoading } = useRequest(
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
			file.preview = await getBase64(file.originFileObj as FileType);
		}
		setPreviewImage(file.url || (file.preview as string));
		setPreviewOpen(true);
	};

	const getContactSelect = (placeholder: React.ReactNode) => {
		return (
			<Select
				showSearch
				labelInValue
				filterOption={false}
				loading={contactsLoading}
				mode="multiple"
				placeholder={placeholder}
				onSearch={value => {
					getContacts(value);
				}}
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
			width={globalContext.global?.isSmallScreen ? '100%' : 550}
			open={props.open}
			confirmLoading={postMomentLoading}
			onOk={async () => {
				const values = await form.validateFields();
				await postMoment({
					id: props.robotId,
					content: values.content,
					media_list: [],
					with_user_list: (values.mention_with || []).map(item => item.value),
					share_type: values.share_type,
					share_with: (values.share_with || []).map(item => item.value),
					donot_share: (values.donot_share || []).map(item => item.value),
				});
				props.onClose();
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
					/>
				</Form.Item>
				<Upload
					style={{ marginBottom: 24 }}
					listType="picture-card"
					fileList={mediaList}
					onPreview={onPreview}
					beforeUpload={file => {
						setMediaList([...mediaList, file]);
						return false;
					}}
				>
					{mediaList.length >= 9 ? null : <PlusOutlined style={{ fontSize: 28 }} />}
				</Upload>
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
						wrapperStyle={{ display: 'none' }}
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
