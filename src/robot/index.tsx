import {
	EditOutlined,
	EllipsisOutlined,
	LoginOutlined,
	LogoutOutlined,
	PlusOutlined,
	ScanOutlined,
	SearchOutlined,
	SettingOutlined,
} from '@ant-design/icons';
import { useBoolean, useRequest, useSetState } from 'ahooks';
import {
	App,
	Avatar,
	Breadcrumb,
	Button,
	Card,
	Col,
	Empty,
	Flex,
	Input,
	Pagination,
	Radio,
	Row,
	Spin,
	Tooltip,
} from 'antd';
import dayjs from 'dayjs';
import NewRobot from './NewRobot';

const actions: React.ReactNode[] = [
	<EditOutlined key="edit" />,
	<SettingOutlined key="setting" />,
	<EllipsisOutlined key="ellipsis" />,
];

const RobotList = () => {
	const { message } = App.useApp();

	const [onNewOpen, setOnNewOpen] = useBoolean(false);
	const [search, setSearch] = useSetState({ keyword: '', status: 'all', pageIndex: 1 });

	const { data, loading, refresh } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1RobotListList({
				keyword: search.keyword,
				status: search.status === 'all' ? undefined : search.status,
				page_index: search.pageIndex,
				page_size: 10,
			});
			return resp.data?.data || [];
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
			<div className="nav">
				<Breadcrumb
					items={[
						{
							key: 'robot-list',
							title: <span style={{ fontSize: 16, fontWeight: 600 }}>机器人列表</span>,
						},
					]}
				/>
				<Button
					type="primary"
					icon={<PlusOutlined />}
					onClick={setOnNewOpen.setTrue}
				>
					创建机器人
				</Button>
			</div>
			<div className="filter">
				<Row
					align="middle"
					wrap={false}
					gutter={8}
				>
					<Col flex="1 1 auto">
						<Input
							size="large"
							placeholder="搜索机器人"
							prefix={<SearchOutlined />}
							allowClear
							onKeyDown={ev => {
								if (ev.key === 'Enter') {
									setSearch({ keyword: ev.currentTarget.value });
								}
							}}
						/>
					</Col>
					<Col flex="0 0 270px">
						<Radio.Group
							size="large"
							optionType="button"
							buttonStyle="solid"
							value={search.status}
							onChange={ev => {
								setSearch({ status: ev.target.value });
							}}
						>
							<Radio.Button value="all">全部</Radio.Button>
							<Radio.Button value="online">在线</Radio.Button>
							<Radio.Button value="offline">离线</Radio.Button>
							<Radio.Button value="error">错误</Radio.Button>
						</Radio.Group>
					</Col>
				</Row>
			</div>
			<div
				className="content"
				style={{ height: 'calc(100vh - 278px)', overflowY: 'auto' }}
			>
				<Spin spinning={loading}>
					<Flex
						gap="middle"
						align="start"
						justify="start"
						wrap="wrap"
					>
						{data?.items?.length ? (
							data.items.map(item => {
								return (
									<Card
										loading={false}
										actions={actions}
										style={{ minWidth: 300 }}
										key={item.id}
									>
										<Card.Meta
											avatar={<Avatar src={item.avatar} />}
											title={
												<Flex
													align="start"
													justify="space-between"
												>
													{item.status === 'online' ? (
														<>
															<span>{item.nickname}</span>
															<Tooltip title="退出登录">
																<Button icon={<LogoutOutlined />} />
															</Tooltip>
														</>
													) : (
														<>
															{item.nickname ? (
																<>
																	<span>{item.nickname}</span>
																	<Tooltip title="重新登录">
																		<Button icon={<LoginOutlined />} />
																	</Tooltip>
																</>
															) : (
																<>
																	<span style={{ color: 'gray' }}>未登陆</span>
																	<Tooltip title="扫码登录">
																		<Button icon={<ScanOutlined />} />
																	</Tooltip>
																</>
															)}
														</>
													)}
												</Flex>
											}
											description={
												<>
													<p>机器人编码: {item.robot_code}</p>
													<p>微信号: {item.wechat_id || '-'}</p>
													<p>
														登录时间:{' '}
														{item.last_login_at ? dayjs(item.last_login_at * 1000).format('YYYY-MM-DD HH:mm:ss') : '-'}
													</p>
												</>
											}
										/>
									</Card>
								);
							})
						) : (
							<Empty description="暂无数据" />
						)}
					</Flex>
				</Spin>
			</div>
			<div className="pagination">
				<Pagination
					align="end"
					current={search.pageIndex}
					pageSize={10}
					total={data?.total || 0}
					showSizeChanger={false}
					showTotal={total => `共 ${total} 条`}
					onChange={page => {
						setSearch({ pageIndex: page });
					}}
				/>
			</div>
			{onNewOpen && (
				<NewRobot
					open={onNewOpen}
					onRefresh={refresh}
					onClose={setOnNewOpen.setFalse}
				/>
			)}
		</div>
	);
};

export default RobotList;
