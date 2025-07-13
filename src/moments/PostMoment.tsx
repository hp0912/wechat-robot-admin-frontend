import { PlusOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { App, Avatar, Col, Form, Image, Input, Modal, Row, Segmented, Select, Upload } from 'antd';
import type { GetProp, UploadFile, UploadProps } from 'antd';
import React, { useContext, useState } from 'react';
import type { Api } from '@/api/wechat-robot/wechat-robot';
import { DefaultAvatar } from '@/constant';
import { GlobalContext } from '@/context/global';

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

type IMomentBody = Api.V1MomentsPostCreate.RequestBody;

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

	const [form] = Form.useForm<IMomentBody & { media_type?: string }>();

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

	return (
		<Modal
			title="发布朋友圈"
			width={globalContext.global?.isSmallScreen ? '100%' : 550}
			open={props.open}
			confirmLoading={postMomentLoading}
			onOk={async () => {
				const values = await form.validateFields();
				values.id = props.robotId;
				delete values.media_type;
				await postMoment(values);
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
							{ value: 'image', label: '图片' },
							{ value: 'video', label: '视频' },
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
					name="share_type"
					initialValue="all"
				>
					<Segmented
						shape="round"
						options={[
							{ value: 'all', label: '分享给所有人' },
							{ value: 'range', label: '分享给指定的人' },
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
						if (shareType === 'range') {
							return (
								<>
									<Form.Item
										name="range"
										initialValue="share_with"
									>
										<Segmented
											shape="round"
											options={[
												{ value: 'share_with', label: '谁可以看' },
												{ value: 'donot_share', label: '不给谁看' },
											]}
										/>
									</Form.Item>
									<Form.Item
										noStyle
										shouldUpdate={(preValues: { range: string }, nextValues: { range: string }) => {
											return preValues.range !== nextValues.range;
										}}
									>
										{({ getFieldValue }) => {
											const range = getFieldValue('range');
											if (range === 'share_with') {
												return (
													<Form.Item
														name="share_with"
														rules={[{ required: true, message: '请选择分享好友' }]}
													>
														<Select
															showSearch
															labelInValue
															filterOption={false}
															loading={contactsLoading}
															mode="multiple"
															placeholder="请选择分享好友"
															onSearch={value => {
																getContacts(value);
															}}
															options={contacts?.items?.map(contact => {
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
																			<Col flex="1 1 auto">
																				{contact.remark || contact.nickname || contact.alias || contact.wechat_id}
																			</Col>
																		</Row>
																	),
																	value: contact.wechat_id,
																	disabled: contact.wechat_id === props.robot.wechat_id,
																};
															})}
														/>
													</Form.Item>
												);
											}
											if (range === 'donot_share') {
												return (
													<Form.Item
														name="donot_share"
														rules={[{ required: true, message: '请选择不给谁看的好友' }]}
													>
														<Select
															showSearch
															labelInValue
															filterOption={false}
															loading={contactsLoading}
															mode="multiple"
															placeholder="请选择不给谁看的好友"
															onSearch={value => {
																getContacts(value);
															}}
															options={contacts?.items?.map(contact => {
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
																			<Col flex="1 1 auto">
																				{contact.remark || contact.nickname || contact.alias || contact.wechat_id}
																			</Col>
																		</Row>
																	),
																	value: contact.wechat_id,
																	disabled: contact.wechat_id === props.robot.wechat_id,
																};
															})}
														/>
													</Form.Item>
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
