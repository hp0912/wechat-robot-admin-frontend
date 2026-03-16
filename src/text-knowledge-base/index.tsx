import { useBoolean, useRequest } from 'ahooks';
import { App, Button, Table } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import TooltipPro from '@/components/TooltipPro';
import { Container } from './styled';
import TextKnowledgeBaseEditor from './TextKnowledgeBaseEditor';

interface IProps {
	robotId: number;
}

const TextKnowledgeBase = (props: IProps) => {
	const { message } = App.useApp();

	const [onNewOpen, setOnNewOpen] = useBoolean(false);

	const { data, loading, refresh } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1KnowledgeCategoriesList({
				id: props.robotId,
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

	return (
		<Container>
			<div className="action-bar">
				<Button
					color="primary"
					variant="solid"
					onClick={setOnNewOpen.setTrue}
				>
					新建知识库
				</Button>
			</div>
			<Table
				rowKey="id"
				dataSource={data}
				scroll={{ x: 'max-content', y: 'calc(100vh - 210px)' }}
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
						width: 140,
						ellipsis: true,
						render: (_, record) => (record.is_builtin ? '是' : '否'),
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
						width: 180,
						ellipsis: true,
						fixed: 'right',
						render: () => {
							return null;
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
				<TextKnowledgeBaseEditor
					open={onNewOpen}
					robotId={props.robotId}
					onClose={setOnNewOpen.setFalse}
					onRefresh={refresh}
				/>
			)}
		</Container>
	);
};

export default React.memo(TextKnowledgeBase);
