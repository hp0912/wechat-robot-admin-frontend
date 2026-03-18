import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useBoolean, useRequest } from 'ahooks';
import { App, Button, Space, Switch, Tooltip } from 'antd';
import React from 'react';
import type { Api } from '@/api/wechat-robot/wechat-robot';
import KnowledgeDocumentEditor from './KnowledgeDocumentEditor';

type IKnowledgeBase = NonNullable<Api.V1KnowledgeCategoriesList.ResponseBody['data']>[number];
type IKnowledgeDocument = NonNullable<Api.V1KnowledgeDocumentsList.ResponseBody['data']>['items'][number];

interface IProps {
	robotId: number;
	knowledgeBase: IKnowledgeBase;
	dataSource?: IKnowledgeDocument;
	onRefresh: () => void;
}

const KnowledgeDocumentActions = (props: IProps) => {
	const { message, modal } = App.useApp();

	const [onEditOpen, setOnEditOpen] = useBoolean(false);

	const { runAsync: onRemove, loading: removeLoading } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1KnowledgeDocumentDelete(
				{
					id: props.robotId,
				},
				{
					id: props.dataSource?.id || 0,
					title: props.dataSource?.title || '',
				},
			);
			return resp.data?.data;
		},
		{
			manual: true,
			onSuccess: () => {
				message.success('删除文档成功');
				props.onRefresh();
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	return (
		<Space size={12}>
			<Switch
				checkedChildren="启用"
				unCheckedChildren="禁用"
				checked={props.dataSource?.enabled}
				// loading={enableLoading || disableLoading}
				disabled
				onChange={checked => {
					if (checked) {
						modal.confirm({
							title: '启用文档',
							content: '确认启用文档？',
							width: 300,
							onOk: async () => {
								//
							},
						});
					} else {
						modal.confirm({
							title: '禁用文档',
							content: '确认禁用文档？',
							width: 300,
							onOk: async () => {
								//
							},
						});
					}
				}}
			/>
			<Tooltip title="编辑文档">
				<Button
					type="primary"
					ghost
					size="small"
					icon={<EditOutlined />}
					onClick={setOnEditOpen.setTrue}
				/>
			</Tooltip>
			<Tooltip title="删除文档">
				<Button
					type="primary"
					danger
					ghost
					size="small"
					loading={removeLoading}
					icon={<DeleteOutlined />}
					onClick={() => {
						modal.confirm({
							title: '删除文档',
							content: (
								<>
									确认删除知识库(<b>{props.knowledgeBase.name}</b>)文档[<b>{props.dataSource?.title}</b>]吗？
								</>
							),
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
				<KnowledgeDocumentEditor
					open={onEditOpen}
					robotId={props.robotId}
					knowledgeBase={props.knowledgeBase}
					dataSource={props.dataSource}
					onClose={setOnEditOpen.setFalse}
					onRefresh={props.onRefresh}
				/>
			)}
		</Space>
	);
};

export default React.memo(KnowledgeDocumentActions);
