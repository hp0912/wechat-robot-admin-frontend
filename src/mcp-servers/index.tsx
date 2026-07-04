import { AppstoreAddOutlined, PlusOutlined } from '@ant-design/icons';
import { useMemoizedFn, useRequest, useSetState } from 'ahooks';
import { Alert, App, Button, Empty, Flex, Pagination, Space, Spin } from 'antd';
import React, { useState } from 'react';
import MCPServer from './MCPServer';
import MCPServerEditor from './MCPServerEditor';
import { CardsContainer } from './styled';

interface IProps {
	robotId: number;
}

const MCPServers = (props: IProps) => {
	const { message } = App.useApp();

	const [mcpServerState, setMCPServerState] = useSetState<{ open: boolean; id?: number }>({ open: false });
	const [pageIndex, setPageIndex] = useState(1);

	const {
		data = [],
		loading,
		refresh,
	} = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.mcpServer.listList({
				id: props.robotId,
			});
			return resp.data?.data || [];
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

	return (
		<Spin spinning={loading}>
			<Flex
				justify="space-between"
				align="center"
				style={{ marginBottom: 16, padding: 8, border: '1px solid #22d3ee2e', borderRadius: 6 }}
			>
				<Space style={{ color: '#0958d9' }}>
					<AppstoreAddOutlined />
					<span>
						前往
						<a
							style={{ color: '#E4DA11' }}
							href="https://github.com/hp0912/wechat-robot-mcp-server"
							target="_blank"
							rel="noopener noreferrer"
						>
							MCP 市场
						</a>
						探索更多工具...
					</span>
				</Space>
				<Button
					color="primary"
					variant="filled"
					icon={<PlusOutlined />}
					onClick={() => {
						setMCPServerState({ open: true, id: undefined });
					}}
				>
					添加 MCP 服务
				</Button>
			</Flex>
			<div>
				{!data?.length ? (
					<Empty />
				) : (
					<CardsContainer>
						{data.slice((pageIndex - 1) * 10, pageIndex * 10).map(item => {
							return (
								<MCPServer
									key={item.id}
									robotId={props.robotId}
									mcpServer={item}
									onEdit={onEdit}
									onRefresh={refresh}
								/>
							);
						})}
					</CardsContainer>
				)}
				<div className="pagination">
					<Pagination
						align="end"
						size="small"
						current={pageIndex}
						pageSize={10}
						total={data.length}
						showSizeChanger={false}
						showTotal={total => `共 ${total} 条`}
						onChange={page => {
							setPageIndex(page);
						}}
					/>
				</div>
				{mcpServerState.open && (
					<MCPServerEditor
						open={mcpServerState.open}
						robotId={props.robotId}
						id={mcpServerState.id}
						onRefresh={refresh}
						onClose={onMCPServerEditorClose}
					/>
				)}
				<Alert
					style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)' }}
					title={
						<span style={{ fontSize: 12 }}>
							文生图/图生图/生成视频/文本转语音，这些功能已经从内置 MCP 服务中移除，请使用{' '}
							<a
								href="https://git.houhoukang.com/houhou/wechat-robot-skills"
								target="_blank"
								rel="noopener noreferrer"
							>
								Skills
							</a>{' '}
							替代这些功能。
						</span>
					}
					type="warning"
					closable
					showIcon
				/>
			</div>
		</Spin>
	);
};

export default React.memo(MCPServers);
