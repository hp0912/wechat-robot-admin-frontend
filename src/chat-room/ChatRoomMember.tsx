import { DownOutlined, SearchOutlined, SettingOutlined } from '@ant-design/icons';
import { useMemoizedFn, useRequest, useSetState } from 'ahooks';
import { App, Avatar, Button, Col, Drawer, Dropdown, Input, List, Pagination, Row, Space, Tag } from 'antd';
import type { DrawerProps } from 'antd';
import dayjs from 'dayjs';
import React, { useContext } from 'react';
import type { Api } from '@/api/wechat-robot/wechat-robot';
import { DefaultAvatar } from '@/constant';
import { GlobalContext } from '@/context/global';
import SpecifiContactMomentList from '@/moments/SpecifiContactMomentList';
import ChatRoomMemberFriend from './ChatRoomMemberFriend';
import ChatRoomMemberRemove from './ChatRoomMemberRemove';
import ChatRoomMemberSettings from './ChatRoomMemberSettings';

interface IProps {
	robotId: number;
	robot: Api.V1RobotViewList.ResponseBody['data'];
	chatRoom: Api.V1ContactListList.ResponseBody['data']['items'][number];
	open: boolean;
	onClose: () => void;
}

interface IAddFriendState {
	chatRoomMemberId?: number;
	chatRoomMemberName?: string;
	open?: boolean;
}

interface IMemberState {
	chatRoomMemberId?: string;
	chatRoomMemberName?: string;
	open?: boolean;
}

interface IMomentState {
	open?: boolean;
	contactAvatar?: string;
	contactId?: string;
	contactName?: string;
}

const GroupMember = (props: IProps) => {
	const { message } = App.useApp();

	const globalContext = useContext(GlobalContext);

	const { chatRoom } = props;

	const [search, setSearch] = useSetState({ keyword: '', pageIndex: 1 });
	const [addFriendState, setAddFriendState] = useSetState<IAddFriendState>({});
	const [momentState, setMomentState] = useSetState<IMomentState>({});
	const [memberSettingsState, setMemberSettingsState] = useSetState<IMemberState>({});
	const [memberRemoveState, setMemberRemoveState] = useSetState<IMemberState>({});

	// 手动同步群成员
	const { runAsync, loading: syncLoading } = useRequest(
		async () => {
			await window.wechatRobotClient.api.v1ChatRoomMembersSyncCreate({
				id: props.robotId,
				chat_room_id: chatRoom.wechat_id,
			});
		},
		{
			manual: true,
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	const { data, loading, refresh } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1ChatRoomMembersList({
				id: props.robotId,
				chat_room_id: chatRoom.wechat_id,
				keyword: search.keyword,
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

	const onAddFriendClose = useMemoizedFn(() => {
		setAddFriendState({ open: false, chatRoomMemberId: undefined, chatRoomMemberName: undefined });
	});

	const onChatRoomMemberSettingsClose = useMemoizedFn(() => {
		setMemberSettingsState({ open: false, chatRoomMemberId: undefined, chatRoomMemberName: undefined });
	});

	const onChatRoomMemberRemoveClose = useMemoizedFn(() => {
		setMemberRemoveState({ open: false, chatRoomMemberId: undefined, chatRoomMemberName: undefined });
	});

	const onMomentClose = useMemoizedFn(() => {
		setMomentState({ open: false, contactId: undefined, contactName: undefined });
	});

	let size: DrawerProps['size'] = 'large';
	if (globalContext.global?.size.width) {
		const { width } = globalContext.global.size;
		size = globalContext.global.isSmallScreen ? width * 0.99 : width - 300;
	}

	return (
		<Drawer
			title={
				<Row
					align="middle"
					wrap={false}
				>
					<Col flex="0 0 32px">
						<Avatar src={chatRoom.avatar || DefaultAvatar} />
					</Col>
					<Col
						flex="0 1 auto"
						className="ellipsis"
						style={{ padding: '0 3px' }}
					>
						{chatRoom.remark || chatRoom.alias || chatRoom.nickname || chatRoom.wechat_id} 的群成员
					</Col>
				</Row>
			}
			extra={
				<Space>
					<Button
						type="primary"
						loading={syncLoading}
						onClick={async () => {
							await runAsync();
							setSearch({ pageIndex: 1 });
							message.success('同步群成员成功');
						}}
					>
						同步群成员
					</Button>
				</Space>
			}
			open={props.open}
			onClose={props.onClose}
			size={size}
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
					<Col flex="0 1 300px">
						<Input
							placeholder="搜索群成员"
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
						loading={loading}
						dataSource={data?.items || []}
						style={{ maxHeight: 'calc(100vh - 185px)', overflowY: 'auto' }}
						renderItem={item => {
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
											<span>
												<span>{item.remark || item.nickname || item.alias}</span>
												<Space
													size="small"
													style={{ marginLeft: 8 }}
												>
													{item.is_admin && (
														<Tag
															color="gold"
															variant="solid"
														>
															管理员
														</Tag>
													)}
													{item.is_blacklisted && (
														<Tag
															color="gray"
															variant="solid"
														>
															黑名单
														</Tag>
													)}
													{item.is_leaved && (
														<Tag
															color="red"
															variant="solid"
														>
															已退群
														</Tag>
													)}
												</Space>
											</span>
										}
										description={
											<>
												{item.is_leaved ? (
													<span>退群时间: {dayjs(Number(item.leaved_at) * 1000).format('YYYY-MM-DD HH:mm:ss')}</span>
												) : (
													<span>
														最近活跃时间: {dayjs(Number(item.last_active_at) * 1000).format('YYYY-MM-DD HH:mm:ss')}
													</span>
												)}
												<b style={{ marginLeft: 8, color: 'goldenrod' }}>积分: {item.score || 0}</b>
												<b style={{ marginLeft: 8, color: 'gray' }}>临时积分: {item.temporary_score || 0}</b>
											</>
										}
									/>
									<div style={{ marginRight: 8 }}>
										<Space.Compact>
											<Button
												type="default"
												disabled={item.is_leaved}
												icon={<SettingOutlined />}
												onClick={() => {
													setMemberSettingsState({
														open: true,
														chatRoomMemberId: item.wechat_id,
														chatRoomMemberName: item.remark || item.nickname || item.alias || item.wechat_id,
													});
												}}
											>
												成员设置
											</Button>
											<Dropdown
												menu={{
													items: [
														{ label: '添加为好友', key: 'add-friend' },
														{ label: '朋友圈', key: 'moments' },
														{ type: 'divider' },
														{ label: '移除群成员', key: 'remove-member', danger: true, disabled: item.is_leaved },
													],
													onClick: ev => {
														switch (ev.key) {
															case 'add-friend':
																setAddFriendState({
																	open: true,
																	chatRoomMemberId: item.id,
																	chatRoomMemberName: item.remark || item.nickname || item.alias || item.wechat_id,
																});
																break;
															case 'moments':
																setMomentState({
																	open: true,
																	contactAvatar: item.avatar,
																	contactId: item.wechat_id,
																	contactName: item.remark || item.nickname || item.alias || item.wechat_id,
																});
																break;
															case 'remove-member':
																setMemberRemoveState({
																	open: true,
																	chatRoomMemberId: item.wechat_id,
																	chatRoomMemberName: item.remark || item.nickname || item.alias || item.wechat_id,
																});
																break;
														}
													},
												}}
											>
												<Button
													key="right"
													type="default"
													disabled={item.is_leaved}
													icon={<DownOutlined />}
												/>
											</Dropdown>
										</Space.Compact>
									</div>
								</List.Item>
							);
						}}
					/>
					{addFriendState.open && (
						<ChatRoomMemberFriend
							robotId={props.robotId}
							chatRoomId={chatRoom.wechat_id!}
							chatRoomName={chatRoom.remark! || chatRoom.nickname! || chatRoom.alias! || chatRoom.wechat_id!}
							chatRoomMemberId={addFriendState.chatRoomMemberId!}
							chatRoomMemberName={addFriendState.chatRoomMemberName!}
							open={addFriendState.open}
							onClose={onAddFriendClose}
						/>
					)}
					{memberSettingsState.open && (
						<ChatRoomMemberSettings
							robotId={props.robotId}
							chatRoomId={chatRoom.wechat_id!}
							chatRoomName={chatRoom.remark! || chatRoom.nickname! || chatRoom.alias! || chatRoom.wechat_id!}
							chatRoomMemberId={memberSettingsState.chatRoomMemberId!}
							chatRoomMemberName={memberSettingsState.chatRoomMemberName!}
							open={memberSettingsState.open}
							onRefresh={refresh}
							onClose={onChatRoomMemberSettingsClose}
						/>
					)}
					{memberRemoveState.open && (
						<ChatRoomMemberRemove
							robotId={props.robotId}
							chatRoomId={chatRoom.wechat_id!}
							chatRoomName={chatRoom.remark! || chatRoom.nickname! || chatRoom.alias! || chatRoom.wechat_id!}
							chatRoomMemberId={memberRemoveState.chatRoomMemberId!}
							chatRoomMemberName={memberRemoveState.chatRoomMemberName!}
							open={memberRemoveState.open}
							onRefresh={refresh}
							onClose={onChatRoomMemberRemoveClose}
						/>
					)}
					{momentState.open && (
						<SpecifiContactMomentList
							open={momentState.open}
							robotId={props.robotId}
							robot={props.robot}
							contactAvatar={momentState.contactAvatar}
							contactId={momentState.contactId}
							contactName={momentState.contactName}
							onClose={onMomentClose}
						/>
					)}
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
							return <span style={{ fontSize: 12, color: 'gray' }}>{`群成员共 ${total} 人`}</span>;
						}}
						onChange={page => {
							setSearch({ pageIndex: page });
						}}
					/>
				</div>
			</div>
		</Drawer>
	);
};

export default React.memo(GroupMember);
