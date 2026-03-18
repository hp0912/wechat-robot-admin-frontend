import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useBoolean, useRequest } from 'ahooks';
import { App, Button, Space, Tooltip } from 'antd';
import React from 'react';
import type { Api } from '@/api/wechat-robot/wechat-robot';
import ImageKnowledgeFilled from '@/icons/ImageKnowledgeFilled';
import TextKnowledgeFilled from '@/icons/TextKnowledgeFilled';
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
	dataSource?: IKnowledgeBase;
	onRefresh: () => void;
}

const KnowledgeBaseActions = (props: IProps) => {
	const { message, modal } = App.useApp();

	const { KnowledgeDocumentComponent } = props;

	const [onEditOpen, setOnEditOpen] = useBoolean(false);
	const [onDocumentOpen, setOnDocumentOpen] = useBoolean(false);

	const { runAsync: onRemove, loading: removeLoading } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1KnowledgeCategoryDelete(
				{
					id: props.robotId,
				},
				{
					id: props.dataSource?.id || 0,
				},
			);
			return resp.data?.data;
		},
		{
			manual: true,
			onSuccess: () => {
				message.success('删除知识库成功');
				props.onRefresh();
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	return (
		<Space size={12}>
			<Tooltip title="知识库文档管理">
				<Button
					type="primary"
					ghost
					size="small"
					icon={props.type === 'text' ? <TextKnowledgeFilled /> : <ImageKnowledgeFilled />}
					onClick={setOnDocumentOpen.setTrue}
				/>
			</Tooltip>
			<Tooltip title="编辑知识库元信息">
				<Button
					type="primary"
					ghost
					size="small"
					icon={<EditOutlined />}
					onClick={setOnEditOpen.setTrue}
				/>
			</Tooltip>
			<Tooltip title={props.dataSource?.is_builtin ? '内置知识库不允许删除' : '删除知识库'}>
				<Button
					type="primary"
					danger
					ghost
					size="small"
					loading={removeLoading}
					disabled={props.dataSource?.is_builtin}
					icon={<DeleteOutlined />}
					onClick={() => {
						modal.confirm({
							title: '删除知识库',
							content: '删除知识库，会删除知识库下面的所有文档，确认删除这个知识库？',
							width: 350,
							okText: '删除',
							okButtonProps: {
								danger: true,
							},
							onOk: async () => {
								await onRemove();
							},
						});
					}}
				/>
			</Tooltip>
			{onEditOpen && (
				<KnowledgeBaseEditor
					open={onEditOpen}
					robotId={props.robotId}
					dataSource={props.dataSource}
					onClose={setOnEditOpen.setFalse}
					onRefresh={props.onRefresh}
				/>
			)}
			{onDocumentOpen && props.dataSource && (
				<KnowledgeDocumentComponent
					open={onDocumentOpen}
					robotId={props.robotId}
					knowledgeBase={props.dataSource}
					onClose={setOnDocumentOpen.setFalse}
				/>
			)}
		</Space>
	);
};

export default React.memo(KnowledgeBaseActions);
