import { PlusOutlined } from '@ant-design/icons';
import { useBoolean, useRequest, useSetState } from 'ahooks';
import { App, Button, Drawer, Table } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import type { Api } from '@/api/wechat-robot/wechat-robot';
import KnowledgeDocumentActions from './KnowledgeDocumentActions';
import KnowledgeDocumentEditor from './KnowledgeDocumentEditor';

type IKnowledgeBase = NonNullable<Api.V1KnowledgeCategoriesList.ResponseBody['data']>[number];

interface IProps {
	robotId: number;
	knowledgeBase: IKnowledgeBase;
	open: boolean;
	onClose: () => void;
}

interface IState {
	pageIndex: number;
}

const PageSize = 20;

const KnowledgeDocument = (props: IProps) => {
	const { message } = App.useApp();

	const [searchState, setSearchState] = useSetState<IState>({ pageIndex: 1 });
	const [onNewOpen, setOnNewOpen] = useBoolean(false);

	const { data, loading, refresh } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1KnowledgeDocumentsList({
				id: props.robotId,
				category: props.knowledgeBase.code,
				page_index: searchState.pageIndex,
				page_size: PageSize,
			});
			return resp.data?.data;
		},
		{
			manual: false,
			refreshDeps: [searchState],
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	return (
		<Drawer
			title={`${props.knowledgeBase.name} - 知识库文档管理`}
			open={props.open}
			onClose={props.onClose}
			size="min(99vw, 75vw)"
			styles={{ header: { paddingTop: 12, paddingBottom: 12 }, body: { paddingTop: 16, paddingBottom: 0 } }}
			extra={
				<Button
					color="primary"
					variant="solid"
					icon={<PlusOutlined />}
					onClick={setOnNewOpen.setTrue}
				>
					新建文档
				</Button>
			}
			footer={null}
		>
			<div>
				<Table
					rowKey="id"
					dataSource={data?.items}
					scroll={{ x: 'max-content', y: 'calc(100vh - 195px)' }}
					columns={[
						{
							title: '标题',
							dataIndex: 'title',
							width: 180,
							ellipsis: true,
						},
						{
							title: '分块数量',
							dataIndex: 'chunk_total',
							width: 180,
							ellipsis: true,
							render: (_, record) => {
								if (typeof record.chunk_total !== 'number') {
									return '-';
								}
								return record.chunk_total;
							},
						},
						{
							title: '向量 ID',
							dataIndex: 'vector_id',
							width: 160,
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
							width: 130,
							ellipsis: true,
							fixed: 'right',
							render: (_, record) => {
								return (
									<KnowledgeDocumentActions
										robotId={props.robotId}
										knowledgeBase={props.knowledgeBase}
										dataSource={record}
										onRefresh={refresh}
									/>
								);
							},
						},
					]}
					loading={loading}
					pagination={{
						current: searchState.pageIndex,
						pageSize: PageSize,
						total: data?.total,
						showSizeChanger: false,
						hideOnSinglePage: true,
						showTotal: (total, range) => `${range[0]}-${range[1]} 条，共 ${total} 条`,
						onChange: page => {
							setSearchState({ pageIndex: page });
						},
					}}
				/>
				{onNewOpen && (
					<KnowledgeDocumentEditor
						open={onNewOpen}
						robotId={props.robotId}
						knowledgeBase={props.knowledgeBase}
						onClose={setOnNewOpen.setFalse}
						onRefresh={refresh}
					/>
				)}
			</div>
		</Drawer>
	);
};

export default React.memo(KnowledgeDocument);
