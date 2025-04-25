import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useBoolean, useRequest, useSetState } from 'ahooks';
import { App, Breadcrumb, Button, Col, Empty, Flex, Input, Pagination, Radio, Row, Spin } from 'antd';
import NewRobot from './NewRobot';
import Robot from './Robot';

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
									<Robot
										key={item.id}
										robot={item}
										onRefresh={refresh}
									/>
								);
							})}
						</Flex>
					) : (
						<>
							{!search.keyword && search.status === 'all' ? (
								<Empty description="您还没有创建过机器人">
									<Button
										type="primary"
										icon={<PlusOutlined />}
										onClick={setOnNewOpen.setTrue}
									>
										立即创建
									</Button>
								</Empty>
							) : null}
							<Empty description="暂无数据" />
						</>
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
