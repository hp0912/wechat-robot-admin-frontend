import { SearchOutlined } from '@ant-design/icons';
import { useBoolean, useDebounceFn, useRequest, useSetState } from 'ahooks';
import {
	App,
	Avatar,
	Button,
	Col,
	DatePicker,
	Drawer,
	Input,
	List,
	Pagination,
	Row,
	Select,
	Space,
	Tag,
	theme,
} from 'antd';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import React from 'react';
import type { ReactNode } from 'react';
import styled from 'styled-components';
import type { Api } from '@/api/wechat-robot/wechat-robot';
import { filterOption } from '@/common/filter-option';
import SendMessage from '@/components/send-message';
import { DefaultAvatar } from '@/constant';
import { AppMessageType, MessageType } from '@/constant/types';
import AttachDownload from './components/AttachDownload';
import ImageDownload from './components/ImageDownload';
import MessageContent from './components/MessageContent';
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

interface IState {
	keyword: string;
	chatRoomMember?: string;
	timeStart?: Dayjs;
	timeEnd?: Dayjs;
	pageIndex: number;
}

const MessageContentContainer = styled.div`
	.text-message {
		margin: 0px;
		padding: 0px;
		white-space: pre-wrap;
		word-break: break-all;
		color: #010101;
		display: inline;
	}

	.refer-message {
		border-left: 3px solid #626675;
		color: #9195a3;
		margin: 0 0 12px 0;
		padding-left: 12px;
		white-space: pre-wrap;
		word-break: break-all;
	}
`;

const ChatHistory = (props: IProps) => {
	const { token } = theme.useToken();
	const { message } = App.useApp();

	const { contact, robot } = props;

	const [search, setSearch] = useSetState<IState>({ keyword: '', pageIndex: 1 });

	const { run: onKeywordDebounced } = useDebounceFn(
		(value: string) => {
			setSearch({ keyword: value, pageIndex: 1 });
		},
		{ wait: 500 },
	);

	const [sendMessageOpen, setSendMessageOpen] = useBoolean(false);

	const { data: chatRoomMember, loading: chatRoomMemberLoading } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1ChatRoomMembersList({
				id: props.robotId,
				chat_room_id: props.contact.wechat_id,
				page_index: 1,
				page_size: 9999,
			});
			const members = resp.data?.data?.items || [];
			const memberMap: Record<string, string> = {};
			members.forEach(item => {
				memberMap[item.wechat_id] = item.remark || item.alias || item.nickname || item.wechat_id;
			});
			return {
				map: memberMap,
				list: members,
			};
		},
		{
			manual: false,
			refreshDeps: [search],
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	const { data, loading } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1ChatHistoryList({
				id: props.robotId,
				contact_id: contact.wechat_id!,
				keyword: search.keyword,
				chat_room_member: search.chatRoomMember,
				time_start: search.timeStart ? dayjs(search.timeStart).unix() : undefined,
				time_end: search.timeEnd ? dayjs(search.timeEnd).unix() : undefined,
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

	const getMessageAvatar = (msg: Api.V1ChatHistoryList.ResponseBody['data']['items'][number]) => {
		if (msg.is_group || msg.sender_wxid !== robot.wechat_id) {
			if (msg.sender_wxid === props.contact.wechat_id) {
				return (
					<Avatar
						style={{ marginLeft: 8 }}
						src={props.contact.avatar || DefaultAvatar}
					/>
				);
			}
			return (
				<Avatar
					style={{ marginLeft: 8 }}
					src={msg.sender_avatar || DefaultAvatar}
				/>
			);
		}
		return (
			<Avatar
				style={{ marginLeft: 8 }}
				src={robot.avatar || DefaultAvatar}
			/>
		);
	};

	const getMessageNickname = (msg: Api.V1ChatHistoryList.ResponseBody['data']['items'][number]) => {
		if (msg.is_group || msg.sender_wxid !== robot.wechat_id) {
			if (msg.sender_wxid === props.contact.wechat_id) {
				return <span style={{ color: '#191919' }}>系统消息</span>;
			}
			return <span>{msg.sender_nickname || msg.sender_wxid}</span>;
		}
		return <span>{robot.nickname || robot.wechat_id}</span>;
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
			size="min(calc(100vw - 32px), max(calc(100vw - 300px), 750px))"
			styles={{ header: { paddingTop: 12, paddingBottom: 12 }, body: { paddingTop: 16, paddingBottom: 0 } }}
			footer={null}
		>
			<div>
				<Space.Compact style={{ marginBottom: 16 }}>
					<Input
						style={{ width: 250 }}
						placeholder="根据关键字搜索"
						prefix={<SearchOutlined />}
						allowClear
						onChange={ev => {
							onKeywordDebounced(ev.target.value);
						}}
					/>
					{props.contact.wechat_id?.endsWith('@chatroom') && (
						<Select
							style={{ width: 250 }}
							placeholder="根据群成员搜索"
							showSearch={{
								filterOption,
							}}
							allowClear
							loading={chatRoomMemberLoading}
							maxTagCount="responsive"
							options={(chatRoomMember?.list || []).map(item => {
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
												{item.is_leaved ? (
													<s>
														{labelText}
														{item.is_leaved && <span style={{ color: 'red' }}> (已退群)</span>}
													</s>
												) : (
													<span>{labelText}</span>
												)}
											</Col>
										</Row>
									),
									value: item.wechat_id,
									text: `${item.remark || ''} ${item.nickname || ''} ${item.alias || ''} ${item.wechat_id}`,
								};
							})}
							value={search.chatRoomMember}
							onChange={value => {
								setSearch({ chatRoomMember: value, pageIndex: 1 });
							}}
						/>
					)}
					<DatePicker.RangePicker
						showTime
						format="YYYY/MM/DD HH:mm:ss"
						presets={[
							{ label: '最近一周', value: [dayjs().add(-7, 'd'), dayjs()] },
							{ label: '最近两周', value: [dayjs().add(-14, 'd'), dayjs()] },
							{ label: '最近一个月', value: [dayjs().add(-30, 'd'), dayjs()] },
							{ label: '最近三个月', value: [dayjs().add(-90, 'd'), dayjs()] },
						]}
						value={search.timeStart && search.timeEnd ? [search.timeStart, search.timeEnd] : undefined}
						onChange={dates => {
							if (!dates || !dates[0] || !dates[1]) {
								setSearch({ timeStart: undefined, timeEnd: undefined, pageIndex: 1 });
								return;
							}
							setSearch({ timeStart: dates[0], timeEnd: dates[1], pageIndex: 1 });
						}}
					/>
				</Space.Compact>
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
										avatar={getMessageAvatar(item)}
										title={
											<span style={{ color: '#87888a' }}>
												{getMessageNickname(item)}
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
														<s>
															<MessageContent
																robotId={props.robotId}
																message={item}
																chatRoomMembers={chatRoomMember?.map}
															/>
														</s>
													</>
												) : (
													<span>
														<MessageContent
															robotId={props.robotId}
															message={item}
															chatRoomMembers={chatRoomMember?.map}
														/>
													</span>
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
