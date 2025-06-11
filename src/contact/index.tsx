import { SearchOutlined } from '@ant-design/icons';
import { useMemoizedFn, useRequest, useSetState } from 'ahooks';
import { App, Avatar, Button, Col, Dropdown, Flex, Input, List, Pagination, Radio, Row, Skeleton } from 'antd';
import type { MenuProps } from 'antd';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import type { ReactNode } from 'react';
import type { Api } from '@/api/wechat-robot/wechat-robot';
import ChatHistory from '@/chat';
import ChatRoomMember from '@/chat-room/ChatRoomMember';
import SendMessage from '@/components/send-message';
import { DefaultAvatar } from '@/constant';
import FemaleFilled from '@/icons/FemaleFilled';
import GroupFilled from '@/icons/GroupFilled';
import MaleFilled from '@/icons/MaleFilled';
import ChatRoomSettings from '@/settings/ChatRoomSettings';
import FriendSettings from '@/settings/FriendSettings';

interface IProps {
	robotId: number;
	robot: Api.V1RobotViewList.ResponseBody['data'];
}

type IContact = Api.V1ContactListList.ResponseBody['data']['items'][number];

const Contact = (props: IProps) => {
	const { message } = App.useApp();

	const [search, setSearch] = useSetState({ keyword: '', type: 'chat_room', pageIndex: 1 });
	const [groupMemberState, setGroupMemberState] = useState<{ open?: boolean; chatRoom?: IContact }>({});
	const [sendMessageState, setSendMessageState] = useState<{ open?: boolean; contactId?: string }>({});
	const [friendSettingsState, setFriendSettingsState] = useState<{ open?: boolean; contact?: IContact }>({});
	const [chatRoomSettingsState, setChatRoomSettingsState] = useState<{ open?: boolean; chatRoom?: IContact }>({});
	const [chatHistoryState, setChatHistoryState] = useState<{ open?: boolean; contact?: IContact; title?: ReactNode }>(
		{},
	);

	const onGroupMemberClose = useMemoizedFn(() => {
		setGroupMemberState({ open: false });
	});

	const onChatHistoryClose = useMemoizedFn(() => {
		setChatHistoryState({ open: false });
	});

	const onSendMessageClose = useMemoizedFn(() => {
		setSendMessageState({ open: false });
	});

	const onFriendSettingsClose = useMemoizedFn(() => {
		setFriendSettingsState({ open: false });
	});

	const onChatRoomSettingsClose = useMemoizedFn(() => {
		setChatRoomSettingsState({ open: false });
	});

	// 手动同步联系人
	const { runAsync, loading: syncLoading } = useRequest(
		async () => {
			await window.wechatRobotClient.api.v1ContactSyncCreate({
				id: props.robotId,
			});
		},
		{
			manual: true,
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	const { data, loading } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1ContactListList({
				id: props.robotId,
				keyword: search.keyword,
				type: search.type === 'all' ? undefined : search.type,
				page_index: search.pageIndex,
				page_size: 20,
			});
			return resp.data?.data;
		},
		{
			manual: false,
			refreshDeps: [search],
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	if (loading) {
		return (
			<Skeleton
				avatar
				active
				paragraph={{ rows: 4 }}
			/>
		);
	}

	return (
		<div>
			<Flex
				justify="space-between"
				align="middle"
			>
				<Row
					style={{ marginBottom: 16 }}
					align="middle"
					wrap={false}
					gutter={8}
				>
					<Col flex="0 0 300px">
						<Input
							placeholder="搜索联系人"
							style={{ width: '100%' }}
							prefix={<SearchOutlined />}
							allowClear
							onKeyDown={ev => {
								if (ev.key === 'Enter') {
									setSearch({ keyword: ev.currentTarget.value, pageIndex: 1 });
								}
							}}
						/>
					</Col>
					<Col flex="0 0 260px">
						<Radio.Group
							optionType="button"
							buttonStyle="solid"
							value={search.type}
							onChange={ev => {
								setSearch({ type: ev.target.value, pageIndex: 1 });
							}}
						>
							<Radio.Button value="chat_room">群聊</Radio.Button>
							<Radio.Button value="friend">朋友</Radio.Button>
							<Radio.Button value="official_account">公众号</Radio.Button>
							<Radio.Button value="all">全部</Radio.Button>
						</Radio.Group>
					</Col>
				</Row>
				<Button
					type="primary"
					style={{ marginRight: 8 }}
					loading={syncLoading}
					ghost
					onClick={async () => {
						await runAsync();
						setSearch({ pageIndex: 1 });
						message.success('同步成功');
					}}
				>
					同步联系人
				</Button>
			</Flex>
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
					dataSource={data?.items || []}
					style={{ maxHeight: 'calc(100vh - 235px)', overflowY: 'auto' }}
					renderItem={item => {
						const items: MenuProps['items'] = [{ label: '发送消息', key: 'send-message' }];
						if (item.type === 'friend') {
							items.push({ label: '好友设置', key: 'friend-settings' });
							items.push({ label: '删除好友', key: 'delete', danger: true });
						} else {
							items.push({ label: '群聊设置', key: 'chat-room-settings' });
							items.push({ label: '查看群成员', key: 'chat-room-member' });
							items.push({ label: '退出群聊', key: 'delete', danger: true });
						}
						return (
							<List.Item>
								<List.Item.Meta
									avatar={
										<Avatar
											style={{ marginLeft: 8 }}
											src={item.avatar || DefaultAvatar}
										/>
									}
									title={
										<>
											<span>{item.nickname || item.alias || item.wechat_id}</span>
											{item.type === 'friend' ? (
												<>
													{item.sex === 1 ? (
														<MaleFilled style={{ color: '#08c0ed', marginLeft: 8 }} />
													) : item.sex === 2 ? (
														<FemaleFilled style={{ color: '#f86363', marginLeft: 8 }} />
													) : (
														<MaleFilled style={{ color: 'gray', marginLeft: 8 }} />
													)}
												</>
											) : item.type === 'official_account' ? null : (
												<GroupFilled style={{ color: '#08db3a', marginLeft: 8 }} />
											)}
										</>
									}
									description={
										<>
											{item.type === 'friend' ? (
												<>
													{item.signature ? (
														<span>{item.signature}</span>
													) : (
														<span style={{ color: 'gray' }}>这家伙很懒，什么都没留下...</span>
													)}
												</>
											) : (
												<span>最近活跃时间: {dayjs(Number(item.updated_at) * 1000).format('YYYY-MM-DD HH:mm:ss')}</span>
											)}
										</>
									}
								/>
								{item.type === 'official_account' ? null : (
									<div style={{ marginRight: 8 }}>
										<Dropdown.Button
											menu={{
												items,
												onClick: ev => {
													switch (ev.key) {
														case 'chat-room-member':
															setGroupMemberState({ open: true, chatRoom: item });
															break;
														case 'send-message':
															setSendMessageState({ open: true, contactId: item.wechat_id });
															break;
														case 'friend-settings':
															setFriendSettingsState({ open: true, contact: item });
															break;
														case 'chat-room-settings':
															setChatRoomSettingsState({ open: true, chatRoom: item });
															break;
													}
												},
											}}
											onClick={() => {
												if (item.type === 'friend') {
													setChatHistoryState({
														open: true,
														contact: item,
														title: `我与${item.nickname || item.alias || item.wechat_id} 的聊天记录`,
													});
												} else {
													setChatHistoryState({
														open: true,
														contact: item,
														title: `${item.nickname || item.alias || item.wechat_id} 的聊天记录`,
													});
												}
											}}
										>
											聊天记录
										</Dropdown.Button>
									</div>
								)}
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
						return <span style={{ fontSize: 12, color: 'gray' }}>{`共 ${total} 联系人`}</span>;
					}}
					onChange={page => {
						setSearch({ pageIndex: page });
					}}
				/>
			</div>
			{groupMemberState.open && (
				<ChatRoomMember
					open={groupMemberState.open}
					robotId={props.robotId}
					chatRoom={groupMemberState.chatRoom!}
					onClose={onGroupMemberClose}
				/>
			)}
			{chatHistoryState.open && (
				<ChatHistory
					open={chatHistoryState.open}
					title={chatHistoryState.title}
					robotId={props.robotId}
					robot={props.robot}
					contact={chatHistoryState.contact!}
					onClose={onChatHistoryClose}
				/>
			)}
			{sendMessageState.open && (
				<SendMessage
					open={sendMessageState.open}
					robotId={props.robotId}
					robot={props.robot}
					contactId={sendMessageState.contactId!}
					onClose={onSendMessageClose}
				/>
			)}
			{friendSettingsState.open && (
				<FriendSettings
					open={friendSettingsState.open}
					robotId={props.robotId}
					contact={friendSettingsState.contact!}
					onClose={onFriendSettingsClose}
				/>
			)}
			{chatRoomSettingsState.open && (
				<ChatRoomSettings
					open={chatRoomSettingsState.open}
					robotId={props.robotId}
					chatRoom={chatRoomSettingsState.chatRoom!}
					onClose={onChatRoomSettingsClose}
				/>
			)}
		</div>
	);
};

export default React.memo(Contact);
