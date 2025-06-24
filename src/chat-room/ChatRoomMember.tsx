import { SearchOutlined } from '@ant-design/icons';
import { useRequest, useSetState } from 'ahooks';
import { App, Avatar, Button, Col, Drawer, Input, List, Pagination, Row, Space, Tag, theme } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import type { Api } from '@/api/wechat-robot/wechat-robot';
import { DefaultAvatar } from '@/constant';

interface IProps {
	robotId: number;
	chatRoom: Api.V1ContactListList.ResponseBody['data']['items'][number];
	open: boolean;
	onClose: () => void;
}

const GroupMember = (props: IProps) => {
	const { token } = theme.useToken();
	const { message } = App.useApp();

	const { chatRoom } = props;

	const [search, setSearch] = useSetState({ keyword: '', pageIndex: 1 });

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

	const { data, loading } = useRequest(
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
						{chatRoom.alias || chatRoom.nickname || chatRoom.wechat_id} 的群成员
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
			width="calc(100vw - 300px)"
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
												<span>{item.nickname || item.alias}</span>
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
