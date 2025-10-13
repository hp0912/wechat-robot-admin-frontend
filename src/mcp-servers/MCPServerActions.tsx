import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Space, Switch } from 'antd';
import React from 'react';
import type { MCPServer } from '@/api/wechat-robot/wechat-robot';

interface IProps {
	mcpServer: MCPServer;
}
const MCPServerActions = (props: IProps) => {
	return (
		<Space>
			{props.mcpServer?.is_built_in ? null : (
				<Button
					color="danger"
					variant="solid"
					size="small"
					icon={<DeleteOutlined />}
				>
					删除
				</Button>
			)}
			<Switch
				checkedChildren="启用"
				unCheckedChildren="禁用"
				checked={props.mcpServer?.enabled}
			/>
			<Button
				color="primary"
				variant="solid"
				size="small"
				icon={<EditOutlined />}
			>
				编辑
			</Button>
		</Space>
	);
};

export default React.memo(MCPServerActions);
