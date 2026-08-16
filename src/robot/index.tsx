import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useBoolean, useMemoizedFn, useRequest, useSetState } from 'ahooks';
import { App, Breadcrumb, Button, Col, Empty, Input, notification, Pagination, Radio, Row, Spin } from 'antd';
import { useEffect } from 'react';
import NewRobot from './NewRobot';
import Robot from './Robot';
import {
	RobotCardsContainer,
	RobotListContent,
	RobotListFilter,
	RobotListHeader,
	RobotListPagination,
	RobotListTitle,
} from './styled';

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
			title: '使用过程中遇到问题？',
			placement: 'bottomRight',
			onClose: () => {
				localStorage.setItem('robot-chat-room-closed', Date.now().toString());
			},
			description: (
				<>
					<h2 style={{ margin: 0 }}>Pro 版本已经上线</h2>
					<h3 style={{ margin: '8px 0' }}>新特性</h3>
					<ul style={{ margin: 0, padding: 0 }}>
						<li>支持设置大模型的推理强度: low high max 等等</li>
						<li>内置搜索文件 / 写入、编辑文件 工具</li>
						<li>开放发送远程文件接口</li>
						<li>
							MCP 工具、Skills 工具、内置工具支持按群/好友启用/禁用，支持设置工具是否要开启审核，支持给工具批量设置权限
						</li>
						<li>
							支持设置定时任务，在制定的群/好友开启定时任务，支持定时发送固定文本/图片艾特指定的人/所有人，支持定时触发大模型
						</li>
						<li>人设管理支持批量设置人设</li>
						<li>机器人出租模式，支持按群开启订阅模式</li>
						<li>优化群聊总结图片样式</li>
						<li>优化群聊排行榜交互，由发送文本改为发送图片</li>
						<li>优化早安设置，早安图片支持自定义</li>
						<li>优化下载文件可能导致文件损坏的问题</li>
						<li>新增了几个内置 Skills，支持总结 PDF Excel Word</li>
						<li>支持群聊消息监控，监控到特定的关键字后艾特指定的人、转发到指定的人</li>
						<li>重构了记忆模块，优化记忆准确性、优化群成员关系建模，能描述更复杂的群成员关系</li>
						<li>群里机器人支持仅管理员能触发，需要先在群聊查看群成员那里将指定群成员设置为管理员</li>
					</ul>
					<h4>欢迎加入我们</h4>
					<img
						src="https://img.houhoukang.com/char-room-qrcode.jpg?v=20260726"
						style={{ width: 100, height: 150, display: 'block' }}
						alt="微信群二维码"
					/>
				</>
			),
			duration: 0,
		});
	}, []);

	const { data, loading, refresh } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.robot.listList({
				keyword: search.keyword,
				status: search.status === 'all' ? undefined : search.status,
				page_index: search.pageIndex,
				page_size: 10,
			});
			return resp.data?.data || {};
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
			title: '创建成功',
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
			<RobotListHeader>
				<Breadcrumb
					items={[
						{
							key: 'robot-list',
							title: <RobotListTitle>机器人列表</RobotListTitle>,
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
			</RobotListHeader>
			<RobotListFilter>
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
			</RobotListFilter>
			<RobotListContent>
				<Spin spinning={loading}>
					{data?.items?.length ? (
						<RobotCardsContainer>
							{data.items.map(item => {
								return (
									<Robot
										key={item.id}
										robot={item}
										onRefresh={refresh}
									/>
								);
							})}
						</RobotCardsContainer>
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
			</RobotListContent>
			<RobotListPagination>
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
			</RobotListPagination>
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
