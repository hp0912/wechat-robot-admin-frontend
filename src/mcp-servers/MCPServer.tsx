import {
	CheckCircleOutlined,
	ClockCircleOutlined,
	CodeOutlined,
	DeleteOutlined,
	EditOutlined,
	ExclamationCircleOutlined,
	EyeOutlined,
	LockOutlined,
	MediumOutlined,
	StopOutlined,
} from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { App, Avatar, Button, Card, Flex, Space, Switch, Tag, theme, Tooltip, Typography } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import type { DtoMCPServer } from '@/api/wechat-robot/wechat-robot';

interface IProps {
	robotId: number;
	mcpServer: DtoMCPServer;
	onEdit: (id: number) => void;
	onRefresh: () => void;
}
const MCPServer = (props: IProps) => {
	const { token } = theme.useToken();
	const { message, modal } = App.useApp();

	const { runAsync: onEnable, loading: enableLoading } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.mcpServer.enableCreate(
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
			const resp = await window.wechatRobotClient.mcpServer.disableCreate(
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
			const resp = await window.wechatRobotClient.mcpServer.mcpServerDelete(
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
			const resp = await window.wechatRobotClient.mcpServer.toolsList({
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
							{!resp || resp.length === 0 ? (
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

	const isOnline = (mcpServer: DtoMCPServer) => {
		if (!mcpServer.enabled) {
			return false;
		}
		return !mcpServer.last_error;
	};

	const getTransportText = (type: DtoMCPServer['transport']) => {
		switch (type) {
			case 'stdio':
				return '命令行模式（标准输入输出）';
			case 'stream':
				return '流模式';
			default:
				return type;
		}
	};

	const getAuthTypeText = (type: DtoMCPServer['auth_type']) => {
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
		<Card
			title={
				<>
					<Avatar
						style={{
							marginRight: 8,
							backgroundColor: props.mcpServer.enabled ? '#08979c' : token.colorTextDisabled,
						}}
						shape="square"
						icon={<CodeOutlined />}
					/>
					{props.mcpServer.name}
				</>
			}
			size="medium"
			styles={{
				root: props.mcpServer.enabled
					? {
							backgroundColor: '#22d3ee0f',
							borderColor: '#22d3ee2e',
						}
					: {
							backgroundColor: '#64748b14',
						},
				body: {
					height: 200,
					overflow: 'hidden',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'space-between',
				},
			}}
			extra={
				props.mcpServer.enabled ? (
					<Tag
						variant="filled"
						color="success"
						icon={<CheckCircleOutlined />}
					>
						启用中
					</Tag>
				) : (
					<Tag
						variant="filled"
						color="default"
						icon={<StopOutlined />}
					>
						已停用
					</Tag>
				)
			}
		>
			<Card.Meta
				description={
					<Typography.Paragraph
						type="secondary"
						styles={{
							root: {
								maxHeight: 88,
								overflow: 'auto',
							},
						}}
						ellipsis={{ rows: 4, expandable: true, symbol: '更多' }}
					>
						{props.mcpServer.description}
					</Typography.Paragraph>
				}
			/>
			<Flex
				vertical
				gap={4}
			>
				<Flex
					justify="start"
					align="center"
				>
					<Flex flex="0 0 90px">
						<LockOutlined style={{ marginRight: 4 }} />
						鉴权方式
					</Flex>
					<Flex flex="1 1 auto">{getAuthTypeText(props.mcpServer.auth_type)}</Flex>
				</Flex>
				<Flex
					justify="start"
					align="center"
				>
					<Flex flex="0 0 90px">
						<MediumOutlined style={{ marginRight: 4 }} />
						传输方式
					</Flex>
					<Flex flex="1 1 auto">{getTransportText(props.mcpServer.transport)}</Flex>
				</Flex>
				<Flex
					justify="start"
					align="center"
				>
					<Flex flex="0 0 90px">
						<ClockCircleOutlined style={{ marginRight: 4 }} />
						安装时间
					</Flex>
					<Flex flex="1 1 auto">{dayjs(props.mcpServer.created_at).format('YYYY-MM-DD HH:mm:ss')}</Flex>
				</Flex>
				<Flex
					justify="space-between"
					align="center"
				>
					<Space size={8}>
						{isOnline(props.mcpServer) ? (
							<Tag
								variant="filled"
								color="success"
								icon={<CheckCircleOutlined />}
							>
								在线
							</Tag>
						) : (
							<Tag
								variant="filled"
								color="default"
								icon={<ExclamationCircleOutlined />}
							>
								离线
							</Tag>
						)}
						{props.mcpServer.is_built_in ? (
							<Tag
								color="#108ee9"
								style={{ marginRight: 8 }}
							>
								官方
							</Tag>
						) : null}
					</Space>
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
											title: '删除 MCP 服务',
											content: (
												<>
													确认删除 MCP 服务<b>{props.mcpServer.name}</b>吗？
												</>
											),
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
										content: (
											<>
												确认启用 MCP 服务<b>{props.mcpServer.name}</b>吗？
											</>
										),
										width: 350,
										onOk: async () => {
											await onEnable();
										},
									});
								} else {
									modal.confirm({
										title: '禁用 MCP 服务',
										content: (
											<>
												确认禁用 MCP 服务<b>{props.mcpServer.name}</b>吗？
											</>
										),
										width: 350,
										onOk: async () => {
											await onDisable();
										},
									});
								}
							}}
						/>
					</Space>
				</Flex>
			</Flex>
		</Card>
	);
};

export default React.memo(MCPServer);
