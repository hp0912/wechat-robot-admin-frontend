import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useBoolean, useMemoizedFn, useRequest, useSetState } from 'ahooks';
import { App, Breadcrumb, Button, Col, Empty, Input, notification, Pagination, Radio, Row, Spin } from 'antd';
import { useEffect } from 'react';
import NewRobot from './NewRobot';
import Robot from './Robot';

const RobotList = () => {
	const { message } = App.useApp();
	const [api, contextHolder] = notification.useNotification();

	const [onNewOpen, setOnNewOpen] = useBoolean(false);
	const [search, setSearch] = useSetState({ keyword: '', status: 'all', pageIndex: 1 });

	useEffect(() => {
		const closed = localStorage.getItem('robot-chat-room-closed');
		if (closed && Date.now() - parseInt(closed, 10) < 1000 * 60 * 60 * 24) {
			// 如果在一天内关闭过提示，则不再提示
			return;
		}
		api.info({
			message: '使用过程中遇到问题？',
			placement: 'bottomRight',
			onClose: () => {
				localStorage.setItem('robot-chat-room-closed', Date.now().toString());
			},
			description: (
				<>
					<p>欢迎加入我们</p>
					<img
						src="https://img.houhoukang.com/char-room-qrcode-1.jpg"
						style={{ width: 300, height: 450, display: 'block' }}
						alt="微信群二维码"
					/>
				</>
			),
			duration: 0,
		});
	}, []);

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

	const onSuccess = useMemoizedFn(() => {
		api.success({
			message: '创建成功',
			description: (
				<>
					<p>机器人创建成功，初始化机器人需要一些时间，请耐心等待。</p>
					<p>
						创建完成后点击机器人卡片中的<b>机器人图标</b>
						查看机器人详情。
					</p>
					<p>
						如果<span style={{ color: 'red' }}>24小时内</span>未登录机器人，机器人实例将会被
						<span style={{ color: 'red' }}>回收</span>，您可以在机器人详情 / 更新镜像的下拉选项的
						<b>创建客户端容器</b>和<b>创建服务端容器</b>重新创建实例。
					</p>
				</>
			),
			duration: 0,
		});
	});

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
									setSearch({ keyword: ev.currentTarget.value, pageIndex: 1 });
								}
							}}
						/>
					</Col>
					<Col flex="0 0 auto">
						<Radio.Group
							size="large"
							optionType="button"
							buttonStyle="solid"
							value={search.status}
							onChange={ev => {
								setSearch({ status: ev.target.value, pageIndex: 1 });
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
						<div className="cards-container">
							{data.items.map(item => {
								return (
									<Robot
										key={item.id}
										robot={item}
										onRefresh={refresh}
									/>
								);
							})}
						</div>
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
					onSuccess={onSuccess}
					onRefresh={refresh}
					onClose={setOnNewOpen.setFalse}
				/>
			)}
			{contextHolder}
		</div>
	);
};

export default RobotList;
