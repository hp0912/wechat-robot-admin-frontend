import Editor from '@monaco-editor/react';
import { useRequest } from 'ahooks';
import { Alert, App, Button, Col, Drawer, Form, Input, Row } from 'antd';
import React from 'react';
import type { Api } from '@/api/wechat-robot/wechat-robot';

type IKnowledgeBase = NonNullable<Api.V1KnowledgeCategoriesList.ResponseBody['data']>[number];
type IKnowledgeDocument = NonNullable<Api.V1KnowledgeDocumentsList.ResponseBody['data']>['items'][number];

interface IFormValues {
	id: number;
	title: string;
	content: string;
	category: string;
	source?: string;
}

interface IProps {
	robotId: number;
	knowledgeBase: IKnowledgeBase;
	dataSource?: IKnowledgeDocument;
	open: boolean;
	onRefresh: () => void;
	onClose: () => void;
}

const DocumentEditor = (props: { value?: string; onChange?: (value?: string) => void }) => {
	return (
		<div
			style={{
				border: '1px solid #d9d9d9',
				borderRadius: 6,
				padding: '8px 2px',
			}}
		>
			<Editor
				width="100%"
				height="calc(100vh - 286px)"
				language="text"
				options={{
					tabSize: 2,
					insertSpaces: true,
					fixedOverflowWidgets: true,
					wordWrap: 'on',
					scrollbar: { alwaysConsumeMouseWheel: false },
				}}
				value={props.value}
				onChange={props.onChange}
			/>
		</div>
	);
};

const KnowledgeDocumentEditor = (props: IProps) => {
	const { message } = App.useApp();

	const [form] = Form.useForm<IFormValues>();

	const { runAsync: onCreate, loading: createLoading } = useRequest(
		async (values: IFormValues) => {
			const resp = await window.wechatRobotClient.api.v1KnowledgeDocumentCreate(
				{
					id: props.robotId,
				},
				values,
			);
			return resp.data?.data;
		},
		{
			manual: true,
			onSuccess: () => {
				message.success('新建成功');
				props.onRefresh();
				props.onClose();
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	const { runAsync: onUpdate, loading: updateLoading } = useRequest(
		async (values: IFormValues) => {
			const resp = await window.wechatRobotClient.api.v1KnowledgeDocumentUpdate(
				{
					id: props.robotId,
				},
				values,
			);
			return resp.data?.data;
		},
		{
			manual: true,
			onSuccess: () => {
				message.success('更新成功');
				props.onRefresh();
				props.onClose();
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	return (
		<Drawer
			title={`${props.dataSource ? '编辑' : '新建'}文档`}
			open={props.open}
			onClose={props.onClose}
			size="min(99vw, 75vw)"
			styles={{
				header: { paddingTop: 12, paddingBottom: 12 },
				body: { paddingTop: 16, paddingBottom: 0 },
				footer: { padding: 0 },
			}}
			footer={
				<Row style={{ overflow: 'hidden' }}>
					<Col span={12}>
						<Button
							size="large"
							type="text"
							block
							style={{ borderRadius: 0 }}
							onClick={props.onClose}
						>
							取消
						</Button>
					</Col>
					<Col span={12}>
						<Button
							size="large"
							type="primary"
							block
							style={{ borderRadius: 0 }}
							loading={createLoading || updateLoading}
							onClick={async () => {
								const values = await form.validateFields();
								if (props.dataSource) {
									await onUpdate({ ...values, id: props.dataSource.id });
								} else {
									await onCreate({ ...values, category: props.knowledgeBase.code });
								}
							}}
						>
							确认
						</Button>
					</Col>
				</Row>
			}
		>
			<Form
				form={form}
				labelCol={{ flex: '0 0 85px' }}
				wrapperCol={{ flex: '1 1 auto' }}
				autoComplete="off"
				initialValues={props.dataSource}
			>
				<Alert
					description="文档片段之间使用两个或以上的空行分片，如果文档内容单个片段超过 1000 个字符，将会被强制分片。"
					type="warning"
					showIcon
					style={{ marginBottom: 16 }}
				/>
				<Form.Item
					name="title"
					label="文档标题"
					rules={[
						{ required: true, message: '请输入文档标题' },
						{ max: 128, message: '文档标题不能超过128个字符' },
					]}
				>
					<Input
						placeholder="请输入文档标题"
						allowClear
					/>
				</Form.Item>
				<Form.Item
					name="content"
					label="文档内容"
					rules={[{ required: true, message: '请输入文档内容' }]}
				>
					<DocumentEditor />
				</Form.Item>
			</Form>
		</Drawer>
	);
};

export default React.memo(KnowledgeDocumentEditor);
