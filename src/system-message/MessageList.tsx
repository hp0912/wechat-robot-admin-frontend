import { useRequest, useSetState } from 'ahooks';
import { App, Avatar, Button, Col, Drawer, Row, Space, Table, Tag, theme } from 'antd';
import type { TableProps } from 'antd';
import dayjs from 'dayjs';
import React, { useContext } from 'react';
import type { Api } from '@/api/wechat-robot/wechat-robot';
import { DefaultAvatar } from '@/constant';
import { GlobalContext } from '@/context/global';
import ChatRoomJoin from './ChatRoomJoin';
import FriendPassVerify from './FriendPassVerify';

type IDataSource = Api.V1SystemMessagesList.ResponseBody['data'][number];

interface IProps {
	open: boolean;
	robotId: number;
	dataSource: IDataSource[];
	onRefresh: () => void;
	onClose: () => void;
}

const MessageList = (props: IProps) => {
	const { token } = theme.useToken();
	const { message, modal } = App.useApp();

	const globalContext = useContext(GlobalContext);

	const [selectedState, setSelectedState] = useSetState<{ keys: number[]; rows: IDataSource[] }>({
		keys: [],
		rows: [],
	});

	const { runAsync, loading } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1SystemMessagesMarkAsReadCreate(
				{ id: props.robotId, system_message_ids: selectedState.keys },
				{ id: props.robotId },
			);
			return resp.data;
		},
		{
			manual: true,
			onSuccess: () => {
				message.success('已成功标记为已读');
				setSelectedState({ keys: [], rows: [] });
				props.onRefresh();
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	const columns: TableProps<IDataSource>['columns'] = [
		{
			title: '类型',
			width: 80,
			dataIndex: 'type',
			fixed: 'left',
			ellipsis: true,
			render: (value: IDataSource['type']) => {
				switch (value) {
					case 37:
						return '好友添加';
					case 38:
						return '邀请入群';
					default:
						return '未知的消息类型';
				}
			},
		},
		{
			title: '描述',
			width: 200,
			dataIndex: 'description',
			ellipsis: true,
			render: (value: IDataSource['description'], record) => {
				return (
					<Row
						align="middle"
						wrap={false}
					>
						<Col flex="0 0 auto">
							<Avatar
								size="small"
								style={{ marginRight: 3 }}
								src={record.image_url || DefaultAvatar}
							/>
						</Col>
						<Col
							flex="1 1 auto"
							className="ellipsis"
						>
							{value || '无描述'}
						</Col>
					</Row>
				);
			},
		},
		{
			title: '已读',
			width: 75,
			dataIndex: 'is_read',
			ellipsis: true,
			render: (value: IDataSource['is_read']) => {
				return value ? <Tag color={token.colorSuccess}>是</Tag> : <Tag color="gray">否</Tag>;
			},
		},
		{
			title: '处理状态',
			width: 90,
			dataIndex: 'status',
			ellipsis: true,
			render: (value: IDataSource['status'], record) => {
				switch (record.type) {
					case 37:
						return value ? <Tag color={token.colorSuccess}>已通过</Tag> : <Tag color="gray">待验证</Tag>;
					case 38:
						return value ? <Tag color={token.colorSuccess}>已同意</Tag> : <Tag color="gray">待同意</Tag>;
					default:
						return <Tag color="gray">未知状态</Tag>;
				}
			},
		},
		{
			title: '创建时间',
			width: 180,
			dataIndex: 'created_at',
			ellipsis: true,
			render: (value: IDataSource['created_at']) => {
				return dayjs(value * 1000).format('YYYY-MM-DD HH:mm:ss');
			},
		},
		{
			title: '处理时间',
			width: 180,
			dataIndex: 'updated_at',
			ellipsis: true,
			render: (value: IDataSource['updated_at'], record) => {
				if (!record.status) {
					return '-';
				}
				return dayjs(value * 1000).format('YYYY-MM-DD HH:mm:ss');
			},
		},
		{
			title: '操作',
			width: 150,
			dataIndex: 'action',
			align: 'center',
			fixed: 'right',
			render: (_, record) => {
				switch (record.type) {
					case 37:
						return (
							<FriendPassVerify
								robotId={props.robotId}
								dataSource={record}
								onRefresh={props.onRefresh}
							/>
						);
					case 38:
						return (
							<ChatRoomJoin
								robotId={props.robotId}
								dataSource={record}
								onRefresh={props.onRefresh}
							/>
						);
					default:
						return null;
				}
			},
		},
	];

	return (
		<Drawer
			title="系统消息"
			open={props.open}
			onClose={props.onClose}
			width={globalContext.global?.isSmallScreen ? '99%' : '75%'}
			styles={{ header: { paddingTop: 12, paddingBottom: 12 }, body: { paddingTop: 16, paddingBottom: 0 } }}
			extra={
				<Space>
					<Button
						type="primary"
						ghost
						loading={loading}
						disabled={selectedState.keys.length === 0}
						onClick={() => {
							modal.confirm({
								title: '批量标记为已读',
								content: `确定将选中的 ${selectedState.keys.length} 条消息标记为已读吗？`,
								onOk: async () => {
									await runAsync();
								},
							});
						}}
					>
						批量标记为已读
					</Button>
				</Space>
			}
			footer={null}
		>
			<Table
				rowKey="id"
				dataSource={props.dataSource}
				scroll={{ x: 'max-content', y: 'calc(100vh - 210px)' }}
				columns={columns}
				pagination={{
					pageSize: 20,
					total: props.dataSource.length,
					showTotal: (total, range) => `${range[0]}-${range[1]} 条，共 ${total} 条`,
				}}
				rowSelection={{
					type: 'checkbox',
					selectedRowKeys: selectedState.keys,
					onChange: (selectedRowKeys: React.Key[], selectedRows: IDataSource[]) => {
						setSelectedState({ keys: selectedRowKeys as number[], rows: selectedRows });
					},
				}}
			/>
		</Drawer>
	);
};

export default React.memo(MessageList);
