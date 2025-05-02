import { SearchOutlined } from '@ant-design/icons';
import { useRequest, useSetState } from 'ahooks';
import { App, Avatar, Col, Dropdown, Input, List, Pagination, Radio, Row } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import FemaleFilled from '@/icons/FemaleFilled';
import GroupFilled from '@/icons/GroupFilled';
import MaleFilled from '@/icons/MaleFilled';

interface IProps {
	robotId: number;
}

const Contact = (props: IProps) => {
	const { message } = App.useApp();

	const [search, setSearch] = useSetState({ keyword: '', type: 'all', pageIndex: 1 });

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

	return (
		<div>
			<Row
				style={{ marginBottom: 16 }}
				align="middle"
				wrap={false}
				gutter={8}
			>
				<Col flex="0 1 350px">
					<Input
						placeholder="搜索联系人"
						prefix={<SearchOutlined />}
						allowClear
						onKeyDown={ev => {
							if (ev.key === 'Enter') {
								setSearch({ keyword: ev.currentTarget.value });
							}
						}}
					/>
				</Col>
				<Col flex="0 0 230px">
					<Radio.Group
						optionType="button"
						buttonStyle="solid"
						value={search.type}
						onChange={ev => {
							setSearch({ type: ev.target.value });
						}}
					>
						<Radio.Button value="all">全部</Radio.Button>
						<Radio.Button value="friend">朋友</Radio.Button>
						<Radio.Button value="group">群聊</Radio.Button>
					</Radio.Group>
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
					loading={loading}
					itemLayout="horizontal"
					dataSource={data?.items || []}
					style={{ maxHeight: 'calc(100vh - 235px)', overflowY: 'auto' }}
					renderItem={item => (
						<List.Item actions={[]}>
							<List.Item.Meta
								avatar={
									<Avatar
										style={{ marginLeft: 8 }}
										src={item.avatar}
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
										) : (
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
													<span style={{ color: 'gray' }}>该家伙很懒，什么都没留下...</span>
												)}
											</>
										) : (
											<span>最近活跃时间: {dayjs(Number(item.updated_at) * 1000).format('YYYY-MM-DD HH:mm:ss')}</span>
										)}
									</>
								}
							/>
							<div style={{ marginRight: 8 }}>
								<Dropdown.Button
									menu={{
										items: [
											{ label: '发送消息', key: 'send-message' },
											{ label: '查看详情', key: 'detail' },
											{ label: item.type === 'friend' ? '删除好友' : '退出群聊', key: 'delete', danger: true },
										],
										onClick: ev => {
											console.log(2, ev);
										},
									}}
									onClick={ev => {
										console.log(1, ev);
									}}
								>
									聊天记录
								</Dropdown.Button>
							</div>
						</List.Item>
					)}
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
		</div>
	);
};

export default React.memo(Contact);
