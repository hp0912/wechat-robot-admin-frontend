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
	chatRoomId: string;
	chatRoomName: string;
	open: boolean;
	onRefresh?: () => void;
	onClose: () => void;
}

const ChatRoomInvite = (props: IProps) => {
	const { token } = theme.useToken();
	const { message } = App.useApp();

	const [search, setSearch] = useSetState({ keyword: '', pageIndex: 1 });
	const [selectedState, setSelectedState] = useSetState<{ keys: number[]; rows: IDataSource[] }>({
		keys: [],
		rows: [],
	});

	const { data, loading, refreshAsync } = useRequest(
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

	const {
		data: chatRoomMembers,
		loading: loadingChatRoomMembers,
		refreshAsync: refreshChatRoomMembers,
	} = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1ChatRoomNotLeftMembersList({
				id: props.robotId,
				chat_room_id: props.chatRoomId,
			});
			const members = resp.data?.data || [];
			const memberMap = new Map<string, Api.V1ChatRoomNotLeftMembersList.ResponseBody['data'][number]>();
			members.forEach(item => {
				memberMap.set(item.wechat_id!, item);
			});
			return memberMap;
		},
		{
			manual: false,
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	const { runAsync: invite, loading: inviteLoading } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1ChatRoomInviteCreate(
				{
					id: props.robotId,
					chat_room_id: props.chatRoomId,
					contact_ids: selectedState.rows.map(item => item.wechat_id!),
				},
				{
					id: props.robotId,
				},
			);
			await new Promise(resolve => setTimeout(resolve, 6000)); // 等待6秒，确保邀请请求已处理
			return resp.data?.data;
		},
		{
			manual: true,
			onSuccess: () => {
				message.success('邀请成功');
				setSelectedState({ keys: [], rows: [] });
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
								src={record.avatar || DefaultAvatar}
							/>
						</Col>
						<Col
							flex="1 1 auto"
							className="ellipsis"
						>
							{record.remark || record.nickname || record.alias || record.wechat_id}
							{chatRoomMembers?.has(record.wechat_id!) && (
								<Tag
									color={token.colorSuccess}
									style={{ marginLeft: 16 }}
								>
									已添加
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
			title={`邀请新成员加入${props.chatRoomName}群聊`}
			open={props.open}
			onClose={props.onClose}
			width="760px"
			styles={{ header: { paddingTop: 12, paddingBottom: 12 }, body: { paddingTop: 16, paddingBottom: 0 } }}
			extra={
				<Space>
					<Button
						type="primary"
						disabled={!selectedState.keys.length || !chatRoomMembers?.size || loading || loadingChatRoomMembers}
						loading={inviteLoading}
						onClick={async () => {
							await invite();
							await refreshAsync();
							await refreshChatRoomMembers();
						}}
					>
						邀请
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
						message="温馨提示：无法进行跨页、跨搜索条件选择"
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
							disabled: chatRoomMembers?.has(record.wechat_id!) || !chatRoomMembers?.size,
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

export default React.memo(ChatRoomInvite);
