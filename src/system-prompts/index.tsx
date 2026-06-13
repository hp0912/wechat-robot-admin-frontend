import { PlusOutlined } from '@ant-design/icons';
import { useBoolean, useRequest, useSetState } from 'ahooks';
import { App, Button, Empty, Input, Space, Spin, Table } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import type { DtoSystemPrompt as SystemPrompt } from '@/api/wechat-robot/wechat-robot';
import SystemPromptActions from './SystemPromptActions';
import SystemPromptEditor from './SystemPromptEditor';

interface IProps {
	className?: string;
	style?: React.CSSProperties;
	robotId: number;
}

interface IState {
	keyword: string;
}

const SystemPrompts = (props: IProps) => {
	const { className = '', style = {} } = props;

	const { message } = App.useApp();

	const [searchState, setSearchState] = useSetState<IState>({ keyword: '' });
	const [onNewOpen, setOnNewOpen] = useBoolean(false);

	const {
		data = [],
		loading,
		refresh,
	} = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.systemPrompts.systemPromptsList({
				id: props.robotId,
				keyword: searchState.keyword,
			});
			return resp.data?.data || [];
		},
		{
			manual: false,
			refreshDeps: [props.robotId, searchState.keyword],
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	return (
		<Spin spinning={loading}>
			<div
				className={className}
				style={style}
			>
				<Space
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						marginBottom: 16,
						paddingRight: 8,
					}}
					wrap
				>
					<Input.Search
						allowClear
						placeholder="搜索标题或提示词内容"
						style={{ width: 320, maxWidth: '100%' }}
						onSearch={keyword => setSearchState({ keyword })}
					/>
					<Button
						color="primary"
						variant="filled"
						icon={<PlusOutlined />}
						onClick={setOnNewOpen.setTrue}
					>
						新建人设
					</Button>
				</Space>
				<Table<SystemPrompt>
					rowKey="id"
					dataSource={data}
					scroll={{ y: 'calc(100vh - 235px)' }}
					locale={{ emptyText: <Empty description="暂无人设" /> }}
					columns={[
						{
							title: '标题',
							dataIndex: 'title',
							width: 180,
							ellipsis: true,
						},
						{
							title: '提示词内容',
							dataIndex: 'content',
							width: 360,
							ellipsis: true,
						},
						{
							title: '更新时间',
							dataIndex: 'updated_at',
							width: 180,
							ellipsis: true,
							render: (_, record) => {
								return dayjs(Number(record.updated_at) * 1000).format('YYYY-MM-DD HH:mm:ss');
							},
						},
						{
							title: '创建时间',
							dataIndex: 'created_at',
							width: 180,
							ellipsis: true,
							render: (_, record) => {
								return dayjs(Number(record.created_at) * 1000).format('YYYY-MM-DD HH:mm:ss');
							},
						},
						{
							title: '操作',
							dataIndex: 'actions',
							width: 110,
							align: 'center',
							fixed: 'right',
							render: (_, record) => {
								return (
									<SystemPromptActions
										robotId={props.robotId}
										dataSource={record}
										onRefresh={refresh}
									/>
								);
							},
						},
					]}
					pagination={false}
				/>
				{onNewOpen && (
					<SystemPromptEditor
						open={onNewOpen}
						robotId={props.robotId}
						onClose={setOnNewOpen.setFalse}
						onRefresh={refresh}
					/>
				)}
			</div>
		</Spin>
	);
};

export default React.memo(SystemPrompts);
