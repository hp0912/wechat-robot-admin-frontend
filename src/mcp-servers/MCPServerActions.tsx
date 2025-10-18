import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Space, Switch, Tooltip } from 'antd';
import React from 'react';
import type { MCPServer } from '@/api/wechat-robot/wechat-robot';

interface IProps {
	mcpServer: MCPServer;
}
const MCPServerActions = (props: IProps) => {
	return (
		<Space size={16}>
			{props.mcpServer?.is_built_in ? null : (
				<Tooltip title="删除">
					<Button
						type="primary"
						danger
						ghost
						size="small"
						icon={<DeleteOutlined />}
					/>
				</Tooltip>
			)}
			<Tooltip title="编辑">
				<Button
					type="primary"
					ghost
					size="small"
					icon={<EditOutlined />}
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
