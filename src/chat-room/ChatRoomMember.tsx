import { DownOutlined, SearchOutlined } from '@ant-design/icons';
import { useMemoizedFn, useRequest, useSetState } from 'ahooks';
import { App, Avatar, Button, Col, Drawer, Dropdown, Input, List, Pagination, Row, Space, Tag, theme } from 'antd';
import dayjs from 'dayjs';
import React, { useContext } from 'react';
import type { Api } from '@/api/wechat-robot/wechat-robot';
import { DefaultAvatar } from '@/constant';
import { GlobalContext } from '@/context/global';
import ChatRoomMemberFriend from './ChatRoomMemberFriend';
import ChatRoomMemberRemove from './ChatRoomMemberRemove';

interface IProps {
	robotId: number;
	chatRoom: Api.V1ContactListList.ResponseBody['data']['items'][number];
	open: boolean;
	onClose: () => void;
}

interface IAddFriendState {
	chatRoomMemberId?: number;
	chatRoomMemberName?: string;
	open?: boolean;
}

interface IMemberRemoveState {
	chatRoomMemberId?: string;
	chatRoomMemberName?: string;
	open?: boolean;
}

const GroupMember = (props: IProps) => {
	const { token } = theme.useToken();
	const { message } = App.useApp();

	const globalContext = useContext(GlobalContext);

	const { chatRoom } = props;

	const [search, setSearch] = useSetState({ keyword: '', pageIndex: 1 });
	const [addFriendState, setAddFriendState] = useSetState<IAddFriendState>({});
	const [memberRemoveState, setMemberRemoveState] = useSetState<IMemberRemoveState>({});

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

	const onChatRoomMemberRemoveClose = useMemoizedFn(() => {
		setMemberRemoveState({ open: false, chatRoomMemberId: undefined, chatRoomMemberName: undefined });
	});

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
												{item.is_admin && (
													<Tag
														color={token.colorSuccess}
														style={{ marginLeft: 8 }}
													>
														管理员
													</Tag>
												)}
												{item.is_leaved && (
													<Tag
														color="gray"
														style={{ marginLeft: 8 }}
													>
														已退群
													</Tag>
												)}
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
											</>
										}
									/>
									<div style={{ marginRight: 8 }}>
										<Dropdown.Button
											menu={{
												items: [{ label: '添加为好友', key: 'add-friend' }],
												onClick: ev => {
													switch (ev.key) {
														case 'add-friend':
															setAddFriendState({
																open: true,
																chatRoomMemberId: item.id,
																chatRoomMemberName: item.remark || item.nickname || item.alias || item.wechat_id,
															});
															break;
													}
												},
											}}
											buttonsRender={() => {
												return [
													<Button
														key="left"
														type="primary"
														ghost
														disabled={item.is_leaved}
														onClick={() => {
															setMemberRemoveState({
																open: true,
																chatRoomMemberId: item.wechat_id,
																chatRoomMemberName: item.remark || item.nickname || item.alias || item.wechat_id,
															});
														}}
													>
														移除群成员
													</Button>,
													<Button
														key="right"
														type="primary"
														ghost
														disabled={item.is_leaved}
														icon={<DownOutlined />}
													/>,
												];
											}}
										/>
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
							onClose={onChatRoomMemberRemoveClose}
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
