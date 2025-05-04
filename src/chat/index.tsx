import { ClockCircleOutlined, PictureOutlined, SearchOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { useRequest, useSetState } from 'ahooks';
import { App, Avatar, Button, Col, Drawer, Input, List, Pagination, Row, Space, Tag, theme } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import type { ReactNode } from 'react';
import type { Api } from '@/api/wechat-robot/wechat-robot';
import { DefaultAvatar, MessageTypeMap } from '@/constant';
import { MessageType } from '@/constant/types';
import VoiceOutlined from '@/icons/VoiceOutlined';

interface IProps {
	robotId: number;
	robot: Api.V1RobotViewList.ResponseBody['data'];
	contact: Api.V1ContactListList.ResponseBody['data']['items'][number];
	open: boolean;
	title: ReactNode;
	onClose: () => void;
}

const ChatHistory = (props: IProps) => {
	const { token } = theme.useToken();
	const { message } = App.useApp();

	const { contact, robot } = props;

	const [search, setSearch] = useSetState({ keyword: '', pageIndex: 1 });

	const { data, loading } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1ChatHistoryList({
				id: props.robotId,
				contact_id: contact.wechat_id!,
				keyword: search.keyword,
				page_index: search.pageIndex,
				page_size: 20,
			});
			return resp.data?.data;
		},
		{
			manual: false,
			refreshDeps: [search],
			pollingInterval: 5000,
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	const messageContentRender = (msg: Api.V1ChatHistoryList.ResponseBody['data']['items'][number]) => {
		const msgType = msg.type as MessageType;
		switch (msgType) {
			case MessageType.Text:
				return msg.content;
			default:
				return `[${MessageTypeMap[msgType] || '未知消息'}]`;
		}
	};

	const downloadButtonRender = (msg: Api.V1ChatHistoryList.ResponseBody['data']['items'][number]) => {
		const msgType = msg.type as MessageType;
		switch (msgType) {
			case MessageType.Image:
				return (
					<Button
						type="primary"
						icon={<PictureOutlined />}
					>
						下载图片
					</Button>
				);
			case MessageType.Video:
				return (
					<Button
						type="primary"
						icon={<VideoCameraOutlined />}
					>
						下载视频
					</Button>
				);
			case MessageType.Voice:
				return (
					<Button
						type="primary"
						icon={<VoiceOutlined />}
					>
						下载语音
					</Button>
				);
			default:
				return null;
		}
	};

	const now = Date.now() / 1000;

	return (
		<Drawer
			title={
				<Row
					align="middle"
					wrap={false}
				>
					<Col flex="0 0 32px">
						<Avatar src={contact.avatar} />
					</Col>
					<Col
						flex="0 1 auto"
						className="ellipsis"
						style={{ padding: '0 3px' }}
					>
						{props.title}
					</Col>
				</Row>
			}
			extra={
				<Space>
					<Button type="primary">发送消息</Button>
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
					<Col flex="0 1 350px">
						<Input
							placeholder="搜索聊天记录"
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
						loading={!data && loading}
						dataSource={data?.items || []}
						style={{ maxHeight: 'calc(100vh - 185px)', overflowY: 'auto' }}
						renderItem={item => {
							return (
								<List.Item>
									<List.Item.Meta
										avatar={
											item.is_group || item.sender_wxid !== robot.wechat_id ? (
												<Avatar
													style={{ marginLeft: 8 }}
													src={item.sender_avatar || DefaultAvatar}
												/>
											) : (
												<Avatar
													style={{ marginLeft: 8 }}
													src={robot.avatar || DefaultAvatar}
												/>
											)
										}
										title={
											<span>
												{item.is_group || item.sender_wxid !== robot.wechat_id ? (
													<span>{item.sender_nickname || item.sender_wxid}</span>
												) : (
													<span>{robot.nickname || robot.wechat_id}</span>
												)}
												<span style={{ fontSize: 13, fontWeight: 300, marginLeft: 8, color: '#191a1b' }}>
													{dayjs(Number(item.created_at) * 1000).format('YYYY-MM-DD HH:mm:ss')}
												</span>
											</span>
										}
										description={
											<div>
												{item.is_recalled ? (
													<>
														<Tag
															color={token.colorWarning}
															style={{ marginRight: 8 }}
														>
															已撤回
														</Tag>
														<s>{messageContentRender(item)}</s>
													</>
												) : (
													<span>{messageContentRender(item)}</span>
												)}
											</div>
										}
									/>
									<Space>
										{item.sender_wxid === robot.wechat_id &&
											!item.is_recalled &&
											now - Number(item.created_at) < 60 * 2 && (
												<Button
													type="primary"
													ghost
													icon={<ClockCircleOutlined />}
												>
													撤回
												</Button>
											)}
										{downloadButtonRender(item)}
									</Space>
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
							return <span style={{ fontSize: 12, color: 'gray' }}>{`共 ${total} 条聊天记录`}</span>;
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

export default React.memo(ChatHistory);
