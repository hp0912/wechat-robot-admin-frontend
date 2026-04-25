import { PlusOutlined, RedoOutlined } from '@ant-design/icons';
import { useBoolean, useRequest } from 'ahooks';
import { App, Button, Space, Table, theme } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import ReactDOM from 'react-dom';
import type { Api } from '@/api/wechat-robot/wechat-robot';
import TooltipPro from '@/components/TooltipPro';
import { Container } from './styled';
import KnowledgeBaseActions from './TextKnowledgeBaseActions';
import KnowledgeBaseEditor from './TextKnowledgeBaseEditor';

type IKnowledgeBase = NonNullable<Api.V1KnowledgeCategoriesList.ResponseBody['data']>[number];

interface IProps {
	robotId: number;
	type: 'text' | 'image';
	KnowledgeDocumentComponent: React.ComponentType<{
		robotId: number;
		knowledgeBase: IKnowledgeBase;
		open: boolean;
		onClose: () => void;
	}>;
	portalContainer?: HTMLElement | null;
}

const KnowledgeBase = (props: IProps) => {
	const { token } = theme.useToken();
	const { message, modal } = App.useApp();

	const [onNewOpen, setOnNewOpen] = useBoolean(false);

	const { data, loading, refresh } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1KnowledgeCategoriesList({
				id: props.robotId,
				type: props.type,
			});
			return resp.data?.data;
		},
		{
			manual: false,
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	const { runAsync: reindex, loading: reindexLoading } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1VectorReindexAllCreate({
				id: props.robotId,
			});
			return resp.data?.data;
		},
		{
			manual: true,
			onSuccess: () => {
				modal.success({
					title: '重建索引任务已创建',
					content: '重建索引任务已创建，预计需要几分钟时间完成，请关注微信客户端容器日志。',
				});
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	return (
		<Container>
			{props.portalContainer &&
				ReactDOM.createPortal(
					<Space>
						<Button
							color="primary"
							variant="filled"
							icon={<RedoOutlined />}
							loading={reindexLoading}
							onClick={() => {
								modal.confirm({
									title: '重建向量库索引',
									content: '重建索引会删除原有索引并重新创建，预计需要几分钟时间完成，确定要继续吗？',
									onOk: async () => {
										await reindex();
									},
								});
							}}
						>
							重建索引
						</Button>
						<Button
							color="primary"
							variant="filled"
							icon={<PlusOutlined />}
							onClick={setOnNewOpen.setTrue}
						>
							新建知识库
						</Button>
					</Space>,
					props.portalContainer,
				)}
			<Table
				rowKey="id"
				dataSource={data}
				scroll={{ x: 'max-content', y: 'calc(100vh - 300px)' }}
				columns={[
					{
						title: '知识库名称',
						dataIndex: 'name',
						width: 180,
						ellipsis: true,
					},
					{
						title: '知识库编码',
						dataIndex: 'code',
						width: 180,
						ellipsis: true,
					},
					{
						title: '描述',
						dataIndex: 'description',
						width: 300,
						ellipsis: true,
						render: (_, record) => {
							return <TooltipPro content={record.description} />;
						},
					},
					{
						title: '系统内置',
						dataIndex: 'is_builtin',
						width: 100,
						ellipsis: true,
						render: (_, record) => {
							if (record.is_builtin) {
								return <span style={{ color: token.colorSuccess }}>是</span>;
							}
							return '否';
						},
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
								<KnowledgeBaseActions
									robotId={props.robotId}
									type={props.type}
									KnowledgeDocumentComponent={props.KnowledgeDocumentComponent}
									dataSource={record}
									onRefresh={refresh}
								/>
							);
						},
					},
				]}
				loading={loading}
				pagination={{
					pageSize: 20,
					total: data?.length,
					showTotal: (total, range) => `${range[0]}-${range[1]} 条，共 ${total} 条`,
				}}
			/>
			{onNewOpen && (
				<KnowledgeBaseEditor
					open={onNewOpen}
					robotId={props.robotId}
					type={props.type}
					onClose={setOnNewOpen.setFalse}
					onRefresh={refresh}
				/>
			)}
		</Container>
	);
};

export default React.memo(KnowledgeBase);
