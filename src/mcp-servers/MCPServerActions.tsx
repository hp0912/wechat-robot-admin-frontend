import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { App, Button, Space, Switch, Tooltip } from 'antd';
import React from 'react';
import type { MCPServer } from '@/api/wechat-robot/wechat-robot';

interface IProps {
	robotId: number;
	mcpServer: MCPServer;
	onEdit: (id: number) => void;
	onRefresh: () => void;
}
const MCPServerActions = (props: IProps) => {
	const { message, modal } = App.useApp();

	const { runAsync: onEnable, loading: enableLoading } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1McpServerEnableCreate(
				{
					id: props.robotId,
				},
				{
					id: props.mcpServer.id!,
				},
			);
			return resp.data?.data;
		},
		{
			manual: true,
			onSuccess: () => {
				message.success('启用成功');
				props.onRefresh();
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	const { runAsync: onDisable, loading: disableLoading } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1McpServerDisableCreate(
				{
					id: props.robotId,
				},
				{
					id: props.mcpServer.id!,
				},
			);
			return resp.data?.data;
		},
		{
			manual: true,
			onSuccess: () => {
				message.success('禁用成功');
				props.onRefresh();
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	const { runAsync: onRemove, loading: removeLoading } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1McpServerDelete(
				{
					id: props.robotId,
				},
				{
					id: props.mcpServer.id!,
				},
			);
			return resp.data?.data;
		},
		{
			manual: true,
			onSuccess: () => {
				message.success('删除成功');
				props.onRefresh();
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	const { runAsync: viewTools, loading: viewLoading } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1McpServerToolsList({
				id: props.robotId,
				mcp_server_id: props.mcpServer.id!,
			});
			return resp.data?.data;
		},
		{
			manual: true,
			onSuccess: resp => {
				modal.info({
					title: ' MCP 服务工具列表',
					width: 600,
					content: (
						<div>
							{resp.length === 0 ? (
								<p>该 MCP 服务器没有可用的工具</p>
							) : (
								<ul style={{ padding: 0 }}>
									{resp.map(item => (
										<li key={item.name}>
											<strong>{item.title || item.name}</strong> - {item.description}
										</li>
									))}
								</ul>
							)}
						</div>
					),
				});
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	return (
		<Space size={8}>
			{props.mcpServer?.is_built_in ? null : (
				<Tooltip title="删除">
					<Button
						type="primary"
						danger
						ghost
						size="small"
						loading={removeLoading}
						icon={<DeleteOutlined />}
						onClick={() => {
							modal.confirm({
								title: '确认删除该 MCP 服务吗？',
								content: '删除后将无法恢复',
								width: 350,
								onOk: async () => {
									await onRemove();
								},
							});
						}}
					/>
				</Tooltip>
			)}
			<Tooltip title="编辑">
				<Button
					type="primary"
					ghost
					size="small"
					icon={<EditOutlined />}
					onClick={() => props.onEdit(props.mcpServer.id!)}
				/>
			</Tooltip>
			<Tooltip title="查看所有工具">
				<Button
					type="primary"
					ghost
					loading={viewLoading}
					size="small"
					icon={<EyeOutlined />}
					disabled={!props.mcpServer?.enabled}
					onClick={viewTools}
				/>
			</Tooltip>
			<Switch
				checkedChildren="启用"
				unCheckedChildren="禁用"
				checked={props.mcpServer?.enabled}
				loading={enableLoading || disableLoading}
				onChange={checked => {
					if (checked) {
						modal.confirm({
							title: '启用 MCP 服务',
							content: '确认启用该 MCP 服务吗？',
							width: 350,
							onOk: async () => {
								await onEnable();
							},
						});
					} else {
						modal.confirm({
							title: '禁用 MCP 服务',
							content: '确认禁用该 MCP 服务吗？',
							width: 350,
							onOk: async () => {
								await onDisable();
							},
						});
					}
				}}
			/>
		</Space>
	);
};

export default React.memo(MCPServerActions);
