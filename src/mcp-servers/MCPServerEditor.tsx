import Editor from '@monaco-editor/react';
import { useRequest } from 'ahooks';
import { App, Button, Col, Drawer, Form, Input, InputNumber, Row, Select, Spin, Switch } from 'antd';
import React from 'react';
import type { MCPServer } from '@/api/wechat-robot/wechat-robot';
import { filterOption } from '@/common/filter-option';
import type { AnyType } from '@/common/types';

interface IProps {
	open: boolean;
	robotId: number;
	id?: number;
	onRefresh: () => void;
	onClose: () => void;
}

const JSONEditor = (props: { value?: string; onChange?: (value?: string) => void }) => {
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
				height="250px"
				language="json"
				options={{}}
				value={props.value}
				onChange={props.onChange}
			/>
		</div>
	);
};

const MCPServerEditor = (props: IProps) => {
	const { message, modal } = App.useApp();

	const [form] = Form.useForm<MCPServer>();

	const respFormat = (field: string, resp: Record<string, AnyType>) => {
		if (field in resp && resp[field]) {
			try {
				resp[field] = JSON.stringify(resp[field], null, 2);
			} catch {
				//
			}
		}
	};

	const reqFormat = (field: string, req: Record<string, AnyType>) => {
		if (field in req && req[field]) {
			try {
				req[field] = JSON.parse(req[field] as unknown as string);
			} catch {
				req[field] = {};
			}
		} else {
			req[field] = {};
		}
	};

	const { loading } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1McpServerList({
				id: props.robotId,
				mcp_server_id: props.id!,
			});
			return resp.data?.data;
		},
		{
			manual: false,
			ready: !!props.id,
			onSuccess: data => {
				['env', 'headers'].forEach(field => respFormat(field, data));
				form.setFieldsValue(data);
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	const { runAsync: onCreate, loading: createLoading } = useRequest(
		async (data: MCPServer) => {
			const resp = await window.wechatRobotClient.api.v1McpServerCreate(
				{
					id: props.robotId,
				},
				data,
			);
			return resp.data?.data;
		},
		{
			manual: true,
			onSuccess: () => {
				message.success('保存成功');
				props.onRefresh();
				props.onClose();
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	const { runAsync: onUpdate, loading: updateLoading } = useRequest(
		async (data: MCPServer) => {
			const resp = await window.wechatRobotClient.api.v1McpServerUpdate(
				{
					id: props.robotId,
				},
				data,
			);
			return resp.data?.data;
		},
		{
			manual: true,
			onSuccess: () => {
				modal.success({
					title: '保存成功',
					content: 'MCP 服务器需要重新启用(禁用 -> 启用)才能生效。',
				});
				props.onRefresh();
				props.onClose();
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	const onOk = async () => {
		const values = await form.validateFields();
		['env', 'headers'].forEach(field => reqFormat(field, values));
		if (props.id) {
			await onUpdate(values);
		} else {
			await onCreate(values);
		}
	};

	return (
		<Drawer
			title={<span>{props.id ? '编辑' : '添加'} MCP 服务器</span>}
			open={props.open}
			onClose={props.onClose}
			width={900}
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
							onClick={onOk}
						>
							确认
						</Button>
					</Col>
				</Row>
			}
		>
			<Spin spinning={loading}>
				<Form
					form={form}
					labelCol={{ flex: '0 0 100px' }}
					wrapperCol={{ flex: '1 1 auto' }}
					autoComplete="off"
					labelWrap
				>
					<Form.Item
						name="id"
						hidden
					>
						<Input />
					</Form.Item>
					<Form.Item
						name="name"
						label="名称"
						rules={[
							{ required: true, message: '请输入MCP服务器名称' },
							{ max: 100, message: 'MCP服务器名称不能超过100个字符' },
						]}
					>
						<Input
							placeholder="请输入MCP服务器名称"
							allowClear
						/>
					</Form.Item>
					<Form.Item
						name="description"
						label="描述"
						rules={[
							{ required: true, message: '请输入MCP服务器描述' },
							{ max: 500, message: 'MCP服务器描述不能超过500个字符' },
						]}
					>
						<Input.TextArea
							rows={3}
							placeholder="请输入MCP服务器描述"
							allowClear
						/>
					</Form.Item>
					<Form.Item
						name="priority"
						label="优先级"
						rules={[{ required: true, message: '请输入MCP服务器优先级' }]}
						tooltip="数字越大优先级越高"
					>
						<InputNumber
							placeholder="请输入MCP服务器优先级"
							style={{ width: '100%' }}
							min={0}
							max={100}
							precision={0}
						/>
					</Form.Item>
					<Form.Item
						name="tags"
						label="标签"
					>
						<Select
							mode="tags"
							style={{ width: '100%' }}
							placeholder="请输入标签"
							maxTagCount="responsive"
							showSearch
							allowClear
							filterOption={filterOption}
							options={[]}
						/>
					</Form.Item>
					<Form.Item
						name="transport"
						label="类型"
						rules={[{ required: true, message: '请选择MCP服务器类型' }]}
						initialValue="http"
					>
						<Select
							style={{ width: '100%' }}
							placeholder="请选择类型"
							showSearch
							filterOption={filterOption}
							options={[
								{ label: '命令行模式（标准输入输出）', value: 'stdio', text: '命令行模式（标准输入输出） stdio' },
								{ label: 'Server-Sent Events模式', value: 'sse', text: 'Server-Sent Events模式 sse' },
								{ label: 'HTTP模式', value: 'http', text: 'HTTP模式' },
								{ label: 'WebSocket模式', value: 'ws', text: 'WebSocket模式' },
							]}
						/>
					</Form.Item>
					<Form.Item
						noStyle
						shouldUpdate={(prevValues: MCPServer, nextValues: MCPServer) =>
							prevValues.transport !== nextValues.transport
						}
					>
						{({ getFieldValue }) => {
							const transport = getFieldValue('transport') as MCPServer['transport'];
							switch (transport) {
								case 'stdio':
									return (
										<>
											<Form.Item
												name="command"
												label="命令"
												rules={[
													{ required: true, message: '请输入命令' },
													{ max: 255, message: '命令不能超过255个字符' },
												]}
											>
												<Input
													placeholder="请输入命令"
													allowClear
												/>
											</Form.Item>
											<Form.Item
												name="working_dir"
												label="运行目录"
												rules={[{ max: 500, message: '运行目录不能超过500个字符' }]}
											>
												<Input
													placeholder="请输入运行目录 (非必填)"
													allowClear
												/>
											</Form.Item>
											<Form.Item
												style={{ flexWrap: 'nowrap' }}
												name="args"
												label="命令行参数"
											>
												<Select
													mode="tags"
													style={{ width: '100%' }}
													placeholder="请输入命令行参数"
													maxTagCount="responsive"
													showSearch
													allowClear
													filterOption={filterOption}
													options={[]}
												/>
											</Form.Item>
											<Form.Item
												style={{ flexWrap: 'nowrap' }}
												name="env"
												label="环境变量"
												initialValue={'{\n    \n}'}
											>
												<JSONEditor />
											</Form.Item>
										</>
									);
								case 'sse':
								case 'http':
								case 'ws':
									return (
										<>
											<Form.Item
												name="url"
												label="服务地址"
												rules={[
													{ required: true, message: '请输入MCP服务地址' },
													{ max: 500, message: 'MCP服务地址不能超过500个字符' },
												]}
											>
												<Input
													placeholder="请输入MCP服务地址"
													allowClear
												/>
											</Form.Item>
											<Form.Item
												name="auth_type"
												label="认证方式"
												rules={[{ required: true, message: '请选择MCP服务器认证方式' }]}
												initialValue="none"
											>
												<Select
													style={{ width: '100%' }}
													placeholder="请选择认证方式"
													showSearch
													filterOption={filterOption}
													options={[
														{
															label: '无认证',
															value: 'none',
															text: '无认证 none',
														},
														{ label: 'Bearer Token认证', value: 'bearer', text: 'Bearer Token认证 bearer' },
														{ label: 'Basic认证', value: 'basic', text: 'Basic认证 basic' },
														{ label: 'API Key认证', value: 'apikey', text: 'API Key认证 apikey' },
													]}
												/>
											</Form.Item>
											<Form.Item
												noStyle
												shouldUpdate={(prevValues: MCPServer, nextValues: MCPServer) =>
													prevValues.auth_type !== nextValues.auth_type
												}
											>
												{({ getFieldValue }) => {
													const authType = getFieldValue('auth_type') as MCPServer['auth_type'];
													switch (authType) {
														case 'bearer':
														case 'apikey':
															return (
																<Form.Item
																	name="auth_token"
																	label="认证密钥"
																	rules={[
																		{ required: true, message: '请输入MCP服务器认证密钥' },
																		{ max: 500, message: 'MCP服务器认证密钥不能超过500个字符' },
																	]}
																>
																	<Input
																		placeholder="请输入MCP服务器认证密钥"
																		allowClear
																	/>
																</Form.Item>
															);
														case 'basic':
															return (
																<>
																	<Form.Item
																		name="auth_username"
																		label="认证用户名"
																		rules={[
																			{ required: true, message: '请输入MCP服务器认证用户名' },
																			{ max: 100, message: 'MCP服务器认证用户名不能超过100个字符' },
																		]}
																	>
																		<Input
																			placeholder="请输入MCP服务器认证用户名"
																			allowClear
																		/>
																	</Form.Item>
																	<Form.Item
																		name="auth_password"
																		label="认证密码"
																		rules={[
																			{ required: true, message: '请输入MCP服务器认证密码' },
																			{ max: 255, message: 'MCP服务器认证密码不能超过255个字符' },
																		]}
																	>
																		<Input
																			placeholder="请输入MCP服务器认证密码"
																			allowClear
																		/>
																	</Form.Item>
																</>
															);
														default:
															return null;
													}
												}}
											</Form.Item>
											<Form.Item
												style={{ flexWrap: 'nowrap' }}
												name="headers"
												label="请求头"
												initialValue={'{\n    \n}'}
											>
												<JSONEditor />
											</Form.Item>
											<Form.Item
												name="tls_skip_verify"
												label="跳过TLS证书验证"
												valuePropName="checked"
												initialValue={false}
											>
												<Switch
													checkedChildren="是"
													unCheckedChildren="否"
												/>
											</Form.Item>
											<Form.Item
												name="connect_timeout"
												label="连接超时时间"
											>
												<InputNumber
													style={{ width: '100%' }}
													placeholder="请输入连接超时时间"
													min={0.1}
													precision={1}
													suffix="秒"
												/>
											</Form.Item>
											<Form.Item
												name="read_timeout"
												label="读取超时时间"
											>
												<InputNumber
													style={{ width: '100%' }}
													placeholder="请输入读取超时时间"
													min={0.1}
													precision={1}
													suffix="秒"
												/>
											</Form.Item>
											<Form.Item
												name="write_timeout"
												label="写入超时时间"
											>
												<InputNumber
													style={{ width: '100%' }}
													placeholder="请输入写入超时时间"
													min={0.1}
													precision={1}
													suffix="秒"
												/>
											</Form.Item>
											<Form.Item
												name="max_retries"
												label="最大重试次数"
											>
												<InputNumber
													style={{ width: '100%' }}
													placeholder="请输入最大重试次数"
													min={1}
													precision={0}
													suffix="次"
												/>
											</Form.Item>
											<Form.Item
												name="retry_interval"
												label="重试时间间隔"
											>
												<InputNumber
													style={{ width: '100%' }}
													placeholder="请输入重试时间间隔"
													min={0.1}
													precision={1}
													suffix="秒"
												/>
											</Form.Item>
											<Form.Item
												name="heartbeat_enable"
												label="心跳检测"
												valuePropName="checked"
												initialValue={false}
											>
												<Switch
													checkedChildren="是"
													unCheckedChildren="否"
												/>
											</Form.Item>
											<Form.Item
												name="heartbeat_interval"
												label="心跳检测间隔"
											>
												<InputNumber
													style={{ width: '100%' }}
													placeholder="请输入心跳检测间隔"
													min={1}
													precision={1}
													suffix="秒"
												/>
											</Form.Item>
										</>
									);
								default:
									return null;
							}
						}}
					</Form.Item>
				</Form>
			</Spin>
		</Drawer>
	);
};

export default React.memo(MCPServerEditor);
