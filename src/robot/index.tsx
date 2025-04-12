import { EditOutlined, EllipsisOutlined, PlusOutlined, SearchOutlined, SettingOutlined } from '@ant-design/icons';
import { useSetState } from 'ahooks';
import { Avatar, Breadcrumb, Button, Card, Col, Flex, Input, Pagination, Radio, Row } from 'antd';

const actions: React.ReactNode[] = [
	<EditOutlined key="edit" />,
	<SettingOutlined key="setting" />,
	<EllipsisOutlined key="ellipsis" />,
];
const loading = false;

const RobotList = () => {
	const [search, setSearch] = useSetState({ keyword: '', status: 'all', pageIndex: 1 });

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
							value={search.keyword}
							onChange={ev => {
								setSearch({ keyword: ev.target.value });
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
				<Flex
					gap="middle"
					align="start"
					justify="center"
					wrap="wrap"
				>
					{new Array(20).fill(0).map((item, index) => {
						return (
							<Card
								loading={loading}
								actions={actions}
								style={{ minWidth: 300 }}
								key={index}
							>
								<Card.Meta
									avatar={<Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=2" />}
									title="Card title"
									description={
										<>
											<p>This is the description</p>
											<p>This is the description</p>
										</>
									}
								/>
							</Card>
						);
					})}
				</Flex>
			</div>
			<div className="pagination">
				<Pagination
					align="end"
					current={search.pageIndex}
					pageSize={10}
					total={2}
					showSizeChanger={false}
					showTotal={total => `共 ${total} 条`}
					onChange={page => {
						setSearch({ pageIndex: page });
					}}
				/>
			</div>
		</div>
	);
};

export default RobotList;
