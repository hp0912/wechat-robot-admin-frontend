import { useRequest } from 'ahooks';
import { App, Button, Col, Drawer, Form, Input, Row } from 'antd';
import React from 'react';
import type { SystemPrompt } from '@/api/wechat-robot/wechat-robot';

interface IFormValues {
	id?: number;
	title: string;
	content: string;
}

interface IProps {
	className?: string;
	style?: React.CSSProperties;
	robotId: number;
	dataSource?: SystemPrompt;
	open: boolean;
	onRefresh: () => void;
	onClose: () => void;
}

const SystemPromptEditor = (props: IProps) => {
	const { className = '', style = {} } = props;

	const { message } = App.useApp();

	const [form] = Form.useForm<IFormValues>();

	const { runAsync: onCreate, loading: createLoading } = useRequest(
		async (values: IFormValues) => {
			const resp = await window.wechatRobotClient.api.v1SystemPromptsCreate(
				{
					id: props.robotId,
				},
				{
					title: values.title,
					content: values.content,
				},
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
			const resp = await window.wechatRobotClient.api.v1SystemPromptsUpdate(
				{
					id: props.robotId,
				},
				{
					id: values.id || 0,
					title: values.title,
					content: values.content,
				},
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
			className={className}
			style={style}
			title={`${props.dataSource ? '编辑' : '新建'}人设`}
			open={props.open}
			onClose={props.onClose}
			size="min(99vw, 600px)"
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
									await onCreate(values);
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
				labelCol={{ flex: '0 0 70px' }}
				wrapperCol={{ flex: '1 1 auto' }}
				autoComplete="off"
				initialValues={props.dataSource}
			>
				<Form.Item
					name="title"
					label="标题"
					rules={[
						{ required: true, message: '请输入标题' },
						{ max: 128, message: '标题不能超过128个字符' },
					]}
				>
					<Input
						placeholder="请输入标题"
						allowClear
					/>
				</Form.Item>
				<Form.Item
					name="content"
					label="提示词"
					rules={[{ required: true, message: '请输入提示词' }]}
				>
					<Input.TextArea
						rows={20}
						placeholder="请输入提示词内容"
						allowClear
					/>
				</Form.Item>
			</Form>
		</Drawer>
	);
};

export default React.memo(SystemPromptEditor);
