import { DeleteOutlined, EditOutlined, EyeOutlined, LoadingOutlined } from '@ant-design/icons';
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

	return (
		<Space size={16}>
			{props.mcpServer?.is_built_in ? null : (
				<Tooltip title="删除">
					<Button
						type="primary"
						danger
						ghost
						size="small"
						icon={removeLoading ? <LoadingOutlined /> : <DeleteOutlined />}
						onClick={() => {
							modal.confirm({
								title: '确认删除该 MCP 服务器吗？',
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
					size="small"
					icon={<EyeOutlined />}
				/>
			</Tooltip>
			<Switch
				checkedChildren="启用"
				unCheckedChildren="禁用"
				checked={props.mcpServer?.enabled}
			/>
		</Space>
	);
};

export default React.memo(MCPServerActions);
