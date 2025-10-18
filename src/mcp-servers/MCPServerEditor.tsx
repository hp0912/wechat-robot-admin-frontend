import Editor from '@monaco-editor/react';
import { Drawer, Form, Input, InputNumber, Select } from 'antd';
import React from 'react';
import type { MCPServer } from '@/api/wechat-robot/wechat-robot';
import { filterOption } from '@/common/filter-option';

interface IProps {
	open: boolean;
	id?: number;
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
	const [form] = Form.useForm<MCPServer>();

	return (
		<Drawer
			title={<span>{props.id ? '编辑' : '添加'} MCP 服务器</span>}
			open={props.open}
			onClose={props.onClose}
			width={900}
			styles={{ header: { paddingTop: 12, paddingBottom: 12 }, body: { paddingTop: 16, paddingBottom: 0 } }}
			footer={null}
		>
			<Form
				form={form}
				labelCol={{ flex: '0 0 110px' }}
				wrapperCol={{ flex: '1 1 auto' }}
				autoComplete="off"
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
					shouldUpdate={(prevValues: MCPServer, nextValues: MCPServer) => prevValues.transport !== nextValues.transport}
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
											initialValue={'{\n    \n}'}
										>
											<JSONEditor />
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
								return null;
							default:
								return null;
						}
					}}
				</Form.Item>
			</Form>
		</Drawer>
	);
};

export default React.memo(MCPServerEditor);
