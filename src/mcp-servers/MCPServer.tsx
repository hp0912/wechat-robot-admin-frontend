import {
	CheckCircleOutlined,
	ClockCircleOutlined,
	DeleteOutlined,
	EditOutlined,
	ExclamationCircleOutlined,
	EyeOutlined,
	LockOutlined,
	MediumOutlined,
	StopOutlined,
} from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { App, Avatar, Button, Card, Space, Switch, theme, Tooltip, Typography } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import type { DtoMCPServer } from '@/api/wechat-robot/wechat-robot';
import MCPFilled from '@/icons/MCPFilled';
import {
	ServerFooter,
	ServerMetaContent,
	ServerMetaGrid,
	ServerMetaIcon,
	ServerMetaItem,
	ServerMetaLabel,
	ServerMetaValue,
	ServerName,
	ServerStatusGroup,
	ServerTitle,
	StatusTag,
} from './styled';

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

	const online = isOnline(props.mcpServer);
	const authTypeText = getAuthTypeText(props.mcpServer.auth_type);
	const transportText = getTransportText(props.mcpServer.transport);
	const createdAtText = dayjs(props.mcpServer.created_at).format('YYYY-MM-DD HH:mm:ss');

	return (
		<Card
			title={
				<ServerTitle>
					<Avatar
						style={{
							backgroundColor: props.mcpServer.enabled ? 'var(--ant-color-primary)' : token.colorTextDisabled,
							boxShadow: props.mcpServer.enabled ? 'var(--app-shadow-icon-accent)' : 'none',
						}}
						shape="square"
						icon={<MCPFilled />}
					/>
					<ServerName>{props.mcpServer.name}</ServerName>
				</ServerTitle>
			}
			size="medium"
			styles={{
				root: props.mcpServer.enabled
					? {
							background:
								'linear-gradient(135deg, var(--ant-color-fill-content-hover) 0%, var(--ant-color-bg-container) 56%, var(--app-color-surface-tint) 100%)',
							borderColor: 'var(--ant-color-info-border)',
							boxShadow: 'var(--ant-box-shadow-secondary)',
						}
					: {
							background: 'linear-gradient(135deg, var(--ant-color-fill-alter) 0%, var(--ant-color-bg-container) 100%)',
							borderColor: 'var(--ant-color-border)',
						},
				body: {
					height: 236,
					overflow: 'hidden',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'space-between',
				},
			}}
			extra={
				props.mcpServer.enabled ? (
					<StatusTag
						$tone="success"
						icon={<CheckCircleOutlined />}
					>
						启用中
					</StatusTag>
				) : (
					<StatusTag
						$tone="neutral"
						icon={<StopOutlined />}
					>
						已停用
					</StatusTag>
				)
			}
		>
			<Card.Meta
				description={
					<Typography.Paragraph
						type="secondary"
						styles={{
							root: {
								maxHeight: 72,
								overflow: 'auto',
							},
						}}
						ellipsis={{ rows: 4, expandable: true, symbol: '更多' }}
					>
						{props.mcpServer.description}
					</Typography.Paragraph>
				}
			/>
			<div>
				<ServerMetaGrid>
					<ServerMetaItem>
						<ServerMetaIcon>
							<LockOutlined />
						</ServerMetaIcon>
						<ServerMetaContent>
							<ServerMetaLabel>鉴权方式</ServerMetaLabel>
							<ServerMetaValue title={authTypeText}>{authTypeText}</ServerMetaValue>
						</ServerMetaContent>
					</ServerMetaItem>
					<ServerMetaItem>
						<ServerMetaIcon>
							<MediumOutlined />
						</ServerMetaIcon>
						<ServerMetaContent>
							<ServerMetaLabel>传输方式</ServerMetaLabel>
							<ServerMetaValue title={transportText}>{transportText}</ServerMetaValue>
						</ServerMetaContent>
					</ServerMetaItem>
					<ServerMetaItem $wide>
						<ServerMetaIcon>
							<ClockCircleOutlined />
						</ServerMetaIcon>
						<ServerMetaContent>
							<ServerMetaLabel>安装时间</ServerMetaLabel>
							<ServerMetaValue title={createdAtText}>{createdAtText}</ServerMetaValue>
						</ServerMetaContent>
					</ServerMetaItem>
				</ServerMetaGrid>
				<ServerFooter>
					<ServerStatusGroup>
						{online ? (
							<StatusTag
								$tone="success"
								icon={<CheckCircleOutlined />}
							>
								在线
							</StatusTag>
						) : (
							<StatusTag
								$tone="warning"
								icon={<ExclamationCircleOutlined />}
							>
								离线
							</StatusTag>
						)}
						{props.mcpServer.is_built_in ? <StatusTag $tone="info">官方</StatusTag> : null}
					</ServerStatusGroup>
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
				</ServerFooter>
			</div>
		</Card>
	);
};

export default React.memo(MCPServer);
