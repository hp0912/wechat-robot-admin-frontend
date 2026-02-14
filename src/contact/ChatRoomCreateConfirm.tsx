import { SearchOutlined } from '@ant-design/icons';
import { useRequest, useSetState } from 'ahooks';
import { Alert, App, Avatar, Button, Col, Drawer, Input, Row, Space, Table, Tag, theme } from 'antd';
import type { TableProps } from 'antd';
import React from 'react';
import type { Api } from '@/api/wechat-robot/wechat-robot';
import { DefaultAvatar } from '@/constant';

type IDataSource = Api.V1ContactListList.ResponseBody['data']['items'][number];

interface IProps {
	robotId: number;
	robot: Api.V1RobotViewList.ResponseBody['data'];
	open: boolean;
	onRefresh?: () => void;
	onClose: () => void;
}

const ChatRoomCreateConfirm = (props: IProps) => {
	const { token } = theme.useToken();
	const { message } = App.useApp();

	const [search, setSearch] = useSetState({ keyword: '', pageIndex: 1 });
	const [selectedState, setSelectedState] = useSetState<{ keys: number[]; rows: IDataSource[] }>({
		keys: [],
		rows: [],
	});

	// 获取联系人
	const { data, loading } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1ContactListList({
				id: props.robotId,
				keyword: search.keyword,
				type: 'friend',
				page_index: search.pageIndex,
				page_size: 50,
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

	// 创建群聊
	const { runAsync: createChatRoom, loading: createLoading } = useRequest(
		async (contactIds: string[]) => {
			const resp = await window.wechatRobotClient.api.v1ChatRoomCreateCreate(
				{
					id: props.robotId,
					contact_ids: contactIds,
				},
				{ id: props.robotId },
			);
			await new Promise(resolve => setTimeout(resolve, 6000)); // 等待6秒，确保群聊创建成功
			return resp.data?.data;
		},
		{
			manual: true,
			onSuccess: () => {
				message.success('你已经成功创建群聊');
				props.onRefresh?.();
				props.onClose();
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	const columns: TableProps<IDataSource>['columns'] = [
		{
			title: '',
			dataIndex: 'contact',
			ellipsis: true,
			render: (_, record) => {
				return (
					<Row
						align="middle"
						wrap={false}
					>
						<Col flex="0 0 auto">
							<Avatar
								size="small"
								style={{ marginRight: 3 }}
								src={props.robot.wechat_id === record.wechat_id ? props.robot.avatar : record.avatar || DefaultAvatar}
							/>
						</Col>
						<Col
							flex="1 1 auto"
							className="ellipsis"
						>
							{props.robot.wechat_id === record.wechat_id
								? props.robot.nickname
								: record.remark || record.nickname || record.alias || record.wechat_id}
							{props.robot.wechat_id === record.wechat_id && (
								<Tag
									color={token.colorSuccess}
									style={{ marginLeft: 3 }}
								>
									自己
								</Tag>
							)}
						</Col>
					</Row>
				);
			},
		},
	];

	return (
		<Drawer
			title="创建新的群聊"
			open={props.open}
			onClose={props.onClose}
			size="min(99vw, 760px)"
			styles={{ header: { paddingTop: 12, paddingBottom: 12 }, body: { paddingTop: 16, paddingBottom: 0 } }}
			extra={
				<Space>
					<Button
						type="primary"
						disabled={!selectedState.keys.length || loading}
						loading={createLoading}
						onClick={async () => {
							const contactIds = selectedState.rows.map(item => item.wechat_id!);
							if (contactIds.includes(props.robot.wechat_id)) {
								message.error('不能将自己添加到群聊中');
								return;
							}
							if (contactIds.length < 2) {
								message.error('发起群聊至少需要2人');
								return;
							}
							await createChatRoom(contactIds);
						}}
					>
						发起群聊
					</Button>
				</Space>
			}
			footer={null}
		>
			<Row
				style={{ paddingBottom: 16, borderBottom: '1px solid #f0f0f0' }}
				align="middle"
				wrap={false}
				gutter={8}
			>
				<Col flex="0 0 300px">
					<Input
						placeholder="搜索联系人"
						style={{ width: '100%' }}
						prefix={<SearchOutlined />}
						allowClear
						onKeyDown={ev => {
							if (ev.key === 'Enter') {
								setSearch({ keyword: ev.currentTarget.value, pageIndex: 1 });
							}
						}}
					/>
				</Col>
				<Col flex="0 0 360px">
					<Alert
						type="warning"
						showIcon
						description="温馨提示：无法进行跨页、跨搜索条件选择"
					/>
				</Col>
			</Row>
			<Table
				rowKey="id"
				dataSource={data?.items || []}
				scroll={{ x: 'max-content', y: 'calc(100vh - 200px)' }}
				showHeader={false}
				loading={loading}
				columns={columns}
				pagination={{
					pageSize: 20,
					total: data?.total || 0,
					showTotal: (total, range) => `${range[0]}-${range[1]} 条，共 ${total} 条`,
					onChange: page => {
						setSelectedState({ keys: [], rows: [] });
						setSearch({ pageIndex: page });
					},
				}}
				rowSelection={{
					type: 'checkbox',
					selectedRowKeys: selectedState.keys,
					getCheckboxProps: record => {
						return {
							disabled: props.robot.wechat_id === record.wechat_id,
						};
					},
					onChange: (selectedRowKeys: React.Key[], rows: IDataSource[]) => {
						setSelectedState({ keys: selectedRowKeys as number[], rows });
					},
				}}
			/>
		</Drawer>
	);
};

export default React.memo(ChatRoomCreateConfirm);
