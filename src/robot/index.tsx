import {
	InteractionFilled,
	LoginOutlined,
	LogoutOutlined,
	PlusOutlined,
	RedoOutlined,
	ReloadOutlined,
	ScanOutlined,
	SearchOutlined,
	SettingFilled,
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
import Remove from './actions/Remove';
import RobotMetadata from './actions/RobotMetadata';
import NewRobot from './NewRobot';

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
					{data?.items?.length ? (
						<Flex
							gap="middle"
							align="start"
							justify="start"
							wrap="wrap"
						>
							{data.items.map(item => {
								return (
									<Card
										loading={false}
										actions={[
											<RobotMetadata
												key="meta"
												robotId={item.id}
												robotStatus={item.status}
											/>,
											<Tooltip
												key="refresh"
												title="刷新机器人状态"
											>
												<Button
													type="text"
													icon={<InteractionFilled />}
												/>
											</Tooltip>,
											<Tooltip
												key="settings"
												title="机器人公共配置"
											>
												<Button
													type="text"
													icon={<SettingFilled />}
												/>
											</Tooltip>,
											<Tooltip
												key="reload-client"
												title="重启机器人客户端"
											>
												<Button
													type="text"
													icon={<RedoOutlined />}
												/>
											</Tooltip>,
											<Tooltip
												key="reload-server"
												title="重启机器人服务端"
											>
												<Button
													type="text"
													icon={<ReloadOutlined />}
												/>
											</Tooltip>,
											<Remove
												key="remove"
												robotId={item.id}
												onRefresh={refresh}
											/>,
										]}
										style={{ width: 300 }}
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
															<div className="ellipsis">
																<span>{item.nickname}</span>
															</div>
															<Tooltip title="退出登录">
																<Button
																	type="text"
																	icon={<LogoutOutlined />}
																/>
															</Tooltip>
														</>
													) : (
														<>
															{item.nickname ? (
																<>
																	<div className="ellipsis">
																		<span>{item.nickname}</span>
																	</div>
																	<Tooltip title="重新登录">
																		<Button
																			type="text"
																			icon={<LoginOutlined />}
																		/>
																	</Tooltip>
																</>
															) : (
																<>
																	<div className="ellipsis">
																		<span style={{ color: 'gray' }}>未登陆</span>
																	</div>
																	<Tooltip title="扫码登录">
																		<Button
																			type="text"
																			icon={<ScanOutlined />}
																		/>
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
							})}
						</Flex>
					) : (
						<Empty description="您还没有创建过机器人">
							<Button
								type="primary"
								icon={<PlusOutlined />}
								onClick={setOnNewOpen.setTrue}
							>
								立即创建
							</Button>
						</Empty>
					)}
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
