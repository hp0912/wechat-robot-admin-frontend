import { useRequest } from 'ahooks';
import { App, Form, Input, Modal } from 'antd';
import React from 'react';
import type { Api } from '@/api/wechat-robot/wechat-robot';

type IDataSource = NonNullable<Api.V1KnowledgeCategoriesList.ResponseBody['data']>[number];

interface IFormValues {
	id: number;
	name: string;
	code: string;
	description?: string;
}

interface IProps {
	robotId: number;
	dataSource?: IDataSource;
	open: boolean;
	onRefresh: () => void;
	onClose: () => void;
}

const TextKnowledgeBaseEditor = (props: IProps) => {
	const { message } = App.useApp();

	const [form] = Form.useForm<IFormValues>();

	const { runAsync: onCreate, loading: createLoading } = useRequest(
		async (values: IFormValues) => {
			const resp = await window.wechatRobotClient.api.v1KnowledgeCategoryCreate(
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
			const resp = await window.wechatRobotClient.api.v1KnowledgeCategoryUpdate(
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
		<Modal
			title={props.dataSource ? '编辑知识库' : '新建知识库'}
			width="min(550px, calc(100vw - 32px))"
			open={props.open}
			confirmLoading={createLoading || updateLoading}
			onOk={async () => {
				const values = await form.validateFields();
				if (props.dataSource) {
					await onUpdate({ ...values, id: props.dataSource.id });
				} else {
					await onCreate(values);
				}
			}}
			onCancel={props.onClose}
		>
			<Form
				form={form}
				labelCol={{ flex: '0 0 95px' }}
				wrapperCol={{ flex: '1 1 auto' }}
				autoComplete="off"
				initialValues={props.dataSource}
			>
				<Form.Item
					name="code"
					label="知识库编码"
					rules={[
						{ required: true, message: '请输入知识库编码' },
						{
							pattern: /^[a-zA-Z][a-zA-Z0-9_-]*$/,
							message: '知识库编码只能包含字母、数字、下划线和连字符且必须以字母开头',
						},
						{ max: 64, message: '知识库编码不能超过64个字符' },
					]}
				>
					<Input
						disabled={!!props.dataSource}
						placeholder="请输入知识库编码"
						allowClear
					/>
				</Form.Item>
				<Form.Item
					name="name"
					label="知识库名称"
					rules={[
						{ required: true, message: '请输入知识库名称' },
						{ max: 128, message: '知识库名称不能超过128个字符' },
					]}
				>
					<Input
						placeholder="请输入知识库名称"
						allowClear
					/>
				</Form.Item>
				<Form.Item
					name="description"
					label="描述"
					rules={[
						{ required: true, message: '请输入描述' },
						{ max: 512, message: '描述不能超过512个字符' },
					]}
				>
					<Input.TextArea
						rows={5}
						placeholder="请输入描述"
						allowClear
					/>
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default React.memo(TextKnowledgeBaseEditor);
