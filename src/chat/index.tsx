import { SearchOutlined } from '@ant-design/icons';
import { useBoolean, useRequest, useSetState } from 'ahooks';
import { App, Avatar, Button, Col, Drawer, Input, List, Pagination, Row, Space, Tag, theme } from 'antd';
import dayjs from 'dayjs';
import React, { useContext } from 'react';
import type { ReactNode } from 'react';
import styled from 'styled-components';
import type { Api } from '@/api/wechat-robot/wechat-robot';
import SendMessage from '@/components/send-message';
import { AppMessageTypeMap, DefaultAvatar, MessageTypeMap } from '@/constant';
import { AppMessageType, MessageType } from '@/constant/types';
import { GlobalContext } from '@/context/global';
import AttachDownload from './components/AttachDownload';
import ImageDownload from './components/ImageDownload';
import MessageRevoke from './components/MessageRevoke';
import VideoDownload from './components/VideoDownload';
import VoiceDownload from './components/VoiceDownload';

interface IProps {
	robotId: number;
	robot: Api.V1RobotViewList.ResponseBody['data'];
	contact: Api.V1ContactListList.ResponseBody['data']['items'][number];
	open: boolean;
	title: ReactNode;
	onClose: () => void;
}

const MessageContentContainer = styled.div`
	.recalled {
		margin: 0px;
		padding: 0px;
		white-space: pre-wrap;
		word-break: break-all;
		color: #010101;
		display: inline;
	}
`;

const ChatHistory = (props: IProps) => {
	const { token } = theme.useToken();
	const { message } = App.useApp();

	const globalContext = useContext(GlobalContext);

	const { contact, robot } = props;

	const [search, setSearch] = useSetState({ keyword: '', pageIndex: 1 });
	const [sendMessageOpen, setSendMessageOpen] = useBoolean(false);

	const { data, loading } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1ChatHistoryList({
				id: props.robotId,
				contact_id: contact.wechat_id!,
				keyword: search.keyword,
				page_index: search.pageIndex,
				page_size: 20,
			});
			return resp.data?.data;
		},
		{
			manual: false,
			refreshDeps: [search],
			pollingInterval: 5000,
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	const messageContentRender = (msg: Api.V1ChatHistoryList.ResponseBody['data']['items'][number]) => {
		const msgType = msg.type as MessageType;
		const subType = msg.app_msg_type as AppMessageType;
		switch (msgType) {
			case MessageType.Text:
				return <pre className="recalled">{msg.content}</pre>;
			case MessageType.App:
				if (msg.display_full_content) {
					return msg.display_full_content;
				}
				return `[${AppMessageTypeMap[subType] || '未知消息'}]`;
			default:
				if (msg.display_full_content) {
					return msg.display_full_content;
				}
				return `[${MessageTypeMap[msgType] || '未知消息'}]`;
		}
	};

	const downloadButtonRender = (msg: Api.V1ChatHistoryList.ResponseBody['data']['items'][number]) => {
		const msgType = msg.type as MessageType;
		const subType = msg.app_msg_type as AppMessageType;
		if (!msg.content) {
			// 自己发送的消息拿不到 xml 内容
			return null;
		}
		switch (msgType) {
			case MessageType.Image:
				return (
					<ImageDownload
						robotId={props.robotId}
						messageId={msg.id}
					/>
				);
			case MessageType.Video:
				return (
					<VideoDownload
						robotId={props.robotId}
						messageId={msg.id}
					/>
				);
			case MessageType.Voice:
				return (
					<VoiceDownload
						robotId={props.robotId}
						messageId={msg.id}
					/>
				);
			case MessageType.App:
				if (subType === AppMessageType.Attach) {
					return (
						<AttachDownload
							robotId={props.robotId}
							messageId={msg.id}
						/>
					);
				}
				return null;
			default:
				return null;
		}
	};

	const now = Date.now() / 1000;

	return (
		<Drawer
			title={
				<Row
					align="middle"
					wrap={false}
				>
					<Col flex="0 0 32px">
						<Avatar src={contact.avatar || DefaultAvatar} />
					</Col>
					<Col
						flex="0 1 auto"
						className="ellipsis"
						style={{ padding: '0 3px' }}
					>
						{props.title}
					</Col>
				</Row>
			}
			extra={
				<Space>
					<Button
						type="primary"
						onClick={setSendMessageOpen.setTrue}
					>
						发送消息
					</Button>
				</Space>
			}
			open={props.open}
			onClose={props.onClose}
			width={globalContext.global?.isSmallScreen ? '99%' : 'calc(100vw - 300px)'}
			styles={{ header: { paddingTop: 12, paddingBottom: 12 }, body: { paddingTop: 16, paddingBottom: 0 } }}
			footer={null}
		>
			<div>
				<Row
					style={{ marginBottom: 16 }}
					align="middle"
					wrap={false}
					gutter={8}
				>
					<Col flex="0 1 350px">
						<Input
							placeholder="搜索聊天记录"
							prefix={<SearchOutlined />}
							allowClear
							onKeyDown={ev => {
								if (ev.key === 'Enter') {
									setSearch({ keyword: ev.currentTarget.value, pageIndex: 1 });
								}
							}}
						/>
					</Col>
				</Row>
				<div
					style={{
						border: '1px solid rgba(5,5,5,0.06)',
						borderRadius: 4,
						marginRight: 2,
					}}
				>
					<List
						rowKey="id"
						itemLayout="horizontal"
						loading={!data && loading}
						dataSource={data?.items || []}
						style={{ maxHeight: 'calc(100vh - 185px)', overflowY: 'auto' }}
						renderItem={item => {
							return (
								<List.Item>
									<List.Item.Meta
										avatar={
											item.is_group || item.sender_wxid !== robot.wechat_id ? (
												<Avatar
													style={{ marginLeft: 8 }}
													src={item.sender_avatar || DefaultAvatar}
												/>
											) : (
												<Avatar
													style={{ marginLeft: 8 }}
													src={robot.avatar || DefaultAvatar}
												/>
											)
										}
										title={
											<span style={{ color: '#87888a' }}>
												{item.is_group || item.sender_wxid !== robot.wechat_id ? (
													<span>{item.sender_nickname || item.sender_wxid}</span>
												) : (
													<span>{robot.nickname || robot.wechat_id}</span>
												)}
												<span style={{ fontSize: 13, fontWeight: 300, marginLeft: 8, color: '#191a1b' }}>
													{dayjs(Number(item.created_at) * 1000).format('YYYY-MM-DD HH:mm:ss')}
												</span>
											</span>
										}
										description={
											<MessageContentContainer>
												{item.is_recalled ? (
													<>
														<Tag
															color={token.colorWarning}
															style={{ marginRight: 8 }}
														>
															已撤回
														</Tag>
														<s>{messageContentRender(item)}</s>
													</>
												) : (
													<span>{messageContentRender(item)}</span>
												)}
											</MessageContentContainer>
										}
									/>
									<div style={{ marginRight: 8 }}>
										<Space>
											{item.sender_wxid === robot.wechat_id &&
												!item.is_recalled &&
												now - Number(item.created_at) < 60 * 2 && (
													<MessageRevoke
														robotId={props.robotId}
														messageId={item.id}
													/>
												)}
											{downloadButtonRender(item)}
										</Space>
									</div>
								</List.Item>
							);
						}}
					/>
				</div>
				<div className="pagination">
					<Pagination
						align="end"
						size="small"
						current={search.pageIndex}
						pageSize={20}
						total={data?.total || 0}
						showSizeChanger={false}
						showTotal={total => {
							return <span style={{ fontSize: 12, color: 'gray' }}>{`共 ${total} 条聊天记录`}</span>;
						}}
						onChange={page => {
							setSearch({ pageIndex: page });
						}}
					/>
				</div>
				{sendMessageOpen && (
					<SendMessage
						open={sendMessageOpen}
						robotId={props.robotId}
						robot={props.robot}
						contact={props.contact}
						onClose={setSendMessageOpen.setFalse}
					/>
				)}
			</div>
		</Drawer>
	);
};

export default React.memo(ChatHistory);
