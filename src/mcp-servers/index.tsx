import { PlusOutlined } from '@ant-design/icons';
import { useMemoizedFn, useRequest, useSetState, useSize } from 'ahooks';
import { App, Button, Empty, List, Spin, Tag } from 'antd';
import VirtualList from 'rc-virtual-list';
import React, { useRef } from 'react';
import type { MCPServer } from '@/api/wechat-robot/wechat-robot';
import MCPServerActions from './MCPServerActions';
import MCPServerEditor from './MCPServerEditor';

interface IProps {
	robotId: number;
}

const MCPServers = (props: IProps) => {
	const { message } = App.useApp();

	const [mcpServerState, setMCPServerState] = useSetState<{ open: boolean; id?: number }>({ open: false });

	const containerRef = useRef<HTMLDivElement>(null);
	const containerSize = useSize(containerRef);

	const { data, loading, refresh } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1McpServerListList({
				id: props.robotId,
			});
			return resp.data?.data;
		},
		{
			manual: false,
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	const onEdit = useMemoizedFn((id: number) => {
		setMCPServerState({ open: true, id });
	});

	const onMCPServerEditorClose = useMemoizedFn(() => {
		setMCPServerState({ open: false, id: undefined });
	});

	const isOnline = (mcpServer: MCPServer) => {
		if (!mcpServer.enabled) {
			return false;
		}
		return !mcpServer.last_error;
	};

	const getTransportText = (type: MCPServer['transport']) => {
		switch (type) {
			case 'stdio':
				return '命令行模式（标准输入输出）';
			case 'stream':
				return '流模式';
			default:
				return type;
		}
	};

	const getAuthTypeText = (type: MCPServer['auth_type']) => {
		switch (type) {
			case 'none':
				return '无鉴权';
			case 'bearer':
				return 'Bearer Token 认证';
			case 'basic':
				return 'Basic 认证';
			case 'apikey':
				return 'API Key 认证';
			default:
				return type;
		}
	};

	return (
		<Spin spinning={loading}>
			<div
				style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 16, paddingRight: 8 }}
			>
				<Button
					type="primary"
					ghost
					icon={<PlusOutlined />}
					onClick={() => {
						setMCPServerState({ open: true, id: undefined });
					}}
				>
					添加 MCP 服务
				</Button>
			</div>
			<div
				style={{ height: 'calc(100vh - 188px)', overflow: 'auto' }}
				ref={containerRef}
			>
				{!data?.length ? (
					<Empty />
				) : (
					<List bordered>
						<VirtualList
							data={data}
							height={containerSize?.height ? containerSize.height - 2 : 0}
							itemHeight={47}
							itemKey="id"
						>
							{item => (
								<List.Item key={item.id}>
									<List.Item.Meta
										title={
											<>
												{isOnline(item) ? (
													<Tag
														color="#87d068"
														style={{ marginRight: 8 }}
													>
														在线
													</Tag>
												) : null}
												{item.is_built_in ? (
													<Tag
														color="#108ee9"
														style={{ marginRight: 8 }}
													>
														官方
													</Tag>
												) : null}
												<span>
													{item.name}{' '}
													<span style={{ fontSize: 12, color: 'gray' }}>
														({getTransportText(item.transport)}, {getAuthTypeText(item.auth_type)})
													</span>
												</span>
											</>
										}
										description={item.description}
									/>
									<div>
										<MCPServerActions
											robotId={props.robotId}
											mcpServer={item}
											onRefresh={refresh}
											onEdit={onEdit}
										/>
									</div>
								</List.Item>
							)}
						</VirtualList>
					</List>
				)}
				{mcpServerState.open && (
					<MCPServerEditor
						open={mcpServerState.open}
						robotId={props.robotId}
						id={mcpServerState.id}
						onRefresh={refresh}
						onClose={onMCPServerEditorClose}
					/>
				)}
			</div>
		</Spin>
	);
};

export default React.memo(MCPServers);
