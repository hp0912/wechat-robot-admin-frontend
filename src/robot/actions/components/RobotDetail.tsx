import {
	ClockCircleOutlined,
	DatabaseOutlined,
	DesktopOutlined,
	EnvironmentOutlined,
	FileTextFilled,
	FundFilled,
	IdcardOutlined,
	KeyOutlined,
	MacCommandFilled,
	OpenAIFilled,
	QrcodeOutlined,
	TagOutlined,
	UserOutlined,
	WechatFilled,
} from '@ant-design/icons';
import { useMemoizedFn, useRequest } from 'ahooks';
import { App, Avatar, BorderBeam, Col, Drawer, Row, Skeleton, Space, Spin, Tabs, Tag, theme } from 'antd';
import type { BorderBeamColor, TabsProps } from 'antd';
import dayjs from 'dayjs';
import React, { Suspense, useEffect } from 'react';
import styled from 'styled-components';
import MCPFilled from '@/icons/MCPFilled';
import MomentsFilled from '@/icons/MomentsFilled';
import OSSFilled from '@/icons/OSSFilled';
import SkillsFilled from '@/icons/SkillsFilled';
import TextKnowledgeFilled from '@/icons/TextKnowledgeFilled';
import GlobalSettings from '@/settings';
import '@/utils/monacoSetup';
import RecreateRobotContainer from '../RecreateRobotContainer';
import Remove from '../Remove';
import RestartRobotContainer from '../RestartRobotContainer';

interface IProps {
	robotId: number;
	open: boolean;
	onListRefresh: () => void;
	onDetailRefresh: () => void;
	onClose: () => void;
	onModuleLoaded?: () => void;
}

const Contact = React.lazy(() => import(/* webpackChunkName: "contact" */ '@/contact'));
const ContainerLog = React.lazy(() => import(/* webpackChunkName: "container-log" */ '@/container-log'));
const Moments = React.lazy(() => import(/* webpackChunkName: "moments" */ '@/moments'));
const SystemSettings = React.lazy(() => import(/* webpackChunkName: "system-settings" */ '@/system-settings'));
const KnowledgeBase = React.lazy(() => import(/* webpackChunkName: "knowledge-base" */ '@/knowledge-base'));
const MCPServers = React.lazy(() => import(/* webpackChunkName: "mcp-servers" */ '@/mcp-servers'));
const Skills = React.lazy(() => import(/* webpackChunkName: "skills" */ '@/skills'));
const OSSSettings = React.lazy(() => import(/* webpackChunkName: "oss-settings" */ '@/oss-settings'));
const SystemOverview = React.lazy(() => import(/* webpackChunkName: "system-overview" */ '@/system-overview'));

const sciFiCyan: BorderBeamColor = [
	{ color: '#22d3ee', percent: 0 },
	{ color: '#52c41a', percent: 36 },
	{ color: '#1677ff', percent: 68 },
	{ color: '#f759ab', percent: 100 },
];

const BaseContainer = styled.div`
	display: flex;
	flex-direction: column;
	height: 100%;
	background: linear-gradient(
			180deg,
			rgba(247, 252, 255, 0.96) 0%,
			rgba(242, 249, 255, 0.96) 52%,
			rgba(250, 255, 252, 0.96) 100%
		),
		repeating-linear-gradient(
			90deg,
			rgba(22, 119, 255, 0.04) 0,
			rgba(22, 119, 255, 0.04) 1px,
			transparent 1px,
			transparent 18px
		);

	.title {
		position: relative;
		margin: 12px;
		padding: 10px 14px 10px 22px;
		border: 1px solid rgba(34, 211, 238, 0.28);
		border-radius: 8px;
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.92), rgba(245, 252, 255, 0.86));
		box-shadow:
			0 8px 22px rgba(22, 119, 255, 0.08),
			inset 0 0 18px rgba(34, 211, 238, 0.08);
		color: #0958d9;
		font-size: 14px;
		font-weight: 600;
		overflow: hidden;
	}

	.title::before {
		position: absolute;
		top: 50%;
		left: 10px;
		width: 4px;
		height: 16px;
		border-radius: 2px;
		background: #22d3ee;
		box-shadow: 0 0 10px rgba(34, 211, 238, 0.58);
		transform: translateY(-50%);
		content: '';
	}

	.base-info-header {
		position: relative;
		isolation: isolate;
		display: flex;
		align-items: center;
		gap: 12px;
		margin: 12px;
		padding: 16px 14px;
		border: 1px solid rgba(34, 211, 238, 0.32);
		border-radius: 8px;
		background: linear-gradient(
				135deg,
				rgba(238, 251, 255, 0.94) 0%,
				rgba(240, 246, 255, 0.9) 58%,
				rgba(249, 255, 246, 0.9) 100%
			),
			repeating-linear-gradient(
				135deg,
				rgba(34, 211, 238, 0.11) 0,
				rgba(34, 211, 238, 0.11) 1px,
				transparent 1px,
				transparent 12px
			);
		box-shadow:
			0 14px 34px rgba(22, 119, 255, 0.12),
			inset 0 1px 0 rgba(255, 255, 255, 0.8);
		overflow: hidden;
	}

	.base-info-beam {
		z-index: 3;
		padding: 2px;
	}

	.base-info-beam::before {
		width: 140px;
		animation-duration: 4.8s;
	}

	.base-info-header::before {
		position: absolute;
		top: 0;
		right: 0;
		width: 96px;
		height: 100%;
		background: linear-gradient(90deg, transparent 0%, rgba(34, 211, 238, 0.16) 48%, rgba(82, 196, 26, 0.12) 100%);
		clip-path: polygon(32% 0, 100% 0, 100% 100%, 0 100%);
		content: '';
		pointer-events: none;
		z-index: 0;
	}

	.base-info-header .ant-avatar,
	.base-info-profile {
		position: relative;
		z-index: 2;
	}

	.base-info-header .ant-avatar {
		box-shadow:
			0 0 0 2px rgba(255, 255, 255, 0.92),
			0 0 18px rgba(34, 211, 238, 0.2);
	}

	.base-info-card {
		position: relative;
		margin: 12px;
		padding: 14px 14px 12px;
		border: 1px solid rgba(34, 211, 238, 0.32);
		border-radius: 8px;
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.92) 0%, rgba(247, 252, 255, 0.88) 100%),
			linear-gradient(135deg, rgba(34, 211, 238, 0.14) 0%, rgba(82, 196, 26, 0.1) 45%, rgba(247, 89, 171, 0.1) 100%);
		box-shadow:
			0 12px 30px rgba(22, 119, 255, 0.08),
			0 0 0 1px rgba(255, 255, 255, 0.75) inset;
		overflow: hidden;
	}

	.base-info-card::before {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 2px;
		background: linear-gradient(
			90deg,
			rgba(34, 211, 238, 0.92) 0%,
			rgba(82, 196, 26, 0.68) 38%,
			rgba(22, 119, 255, 0.72) 70%,
			rgba(247, 89, 171, 0.78) 100%
		);
		content: '';
	}

	.base-info-card::after {
		position: absolute;
		top: 8px;
		right: 8px;
		width: 26px;
		height: 13px;
		border-top: 1px solid rgba(34, 211, 238, 0.62);
		border-right: 1px solid rgba(34, 211, 238, 0.62);
		content: '';
		pointer-events: none;
	}

	.base-info-card-title {
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: 6px;
		margin-bottom: 8px;
		font-size: 12px;
		font-weight: 600;
		color: #0958d9;
		letter-spacing: 0.5px;
	}

	.base-info-card-title::before {
		width: 6px;
		height: 6px;
		border: 1px solid #22d3ee;
		background: #e6fffb;
		box-shadow: 0 0 8px rgba(34, 211, 238, 0.72);
		content: '';
	}

	.base-info-row {
		position: relative;
		display: flex;
		align-items: flex-start;
		gap: 12px;
		padding: 8px 0;
	}

	.base-info-row + .base-info-row {
		border-top: 1px solid rgba(34, 211, 238, 0.14);
	}

	.base-info-label {
		display: flex;
		align-items: center;
		gap: 6px;
		flex: 0 0 96px;
		font-size: 12px;
		color: rgba(0, 42, 76, 0.58);
		white-space: nowrap;
	}

	.base-info-label .anticon {
		font-size: 13px;
		color: #08979c;
		filter: drop-shadow(0 0 6px rgba(34, 211, 238, 0.36));
		opacity: 0.78;
	}

	.base-info-value {
		flex: 1 1 auto;
		font-size: 13px;
		color: rgba(0, 0, 0, 0.78);
		line-height: 20px;
		word-break: break-all;
		min-width: 0;
	}
`;

const InfoRow = ({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) => (
	<div className="base-info-row">
		<div className="base-info-label">
			{icon}
			{label}
		</div>
		<div className="base-info-value ellipsis">{children}</div>
	</div>
);

const RobotDetail = (props: IProps) => {
	const { message } = App.useApp();
	const { token } = theme.useToken();

	const { open, onClose } = props;

	useEffect(() => {
		props.onModuleLoaded?.();
	}, []);

	const { data, loading, refresh } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1RobotViewList({
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

	const onRefresh = useMemoizedFn(() => {
		refresh();
		props.onDetailRefresh();
	});

	const onRemoveRefresh = useMemoizedFn(() => {
		props.onListRefresh();
		props.onClose();
	});

	if (!data) {
		return (
			<Skeleton
				avatar
				active
				paragraph={{ rows: 4 }}
			/>
		);
	}

	const items: TabsProps['items'] = [
		{
			key: 'concact',
			icon: <WechatFilled />,
			label: '联系人',
			children: (
				<Contact
					robotId={props.robotId}
					robot={data}
				/>
			),
		},
		{
			key: 'moments',
			icon: <MomentsFilled />,
			label: '朋友圈',
			children: (
				<Suspense fallback={<Spin />}>
					<Moments
						robotId={props.robotId}
						robot={data}
					/>
				</Suspense>
			),
		},
		{
			key: 'global-settings',
			icon: <OpenAIFilled />,
			label: '全局设置',
			children: <GlobalSettings robotId={props.robotId} />,
		},
		{
			key: 'system-settings',
			icon: <MacCommandFilled />,
			label: '系统设置',
			children: (
				<Suspense fallback={<Spin />}>
					<SystemSettings robotId={props.robotId} />
				</Suspense>
			),
		},
		{
			key: 'text-knowledge-base',
			icon: <TextKnowledgeFilled />,
			label: '知识库',
			children: (
				<Suspense fallback={<Spin />}>
					<KnowledgeBase robotId={props.robotId} />
				</Suspense>
			),
		},
		{
			key: 'mcp-servers',
			icon: <MCPFilled />,
			label: 'MCP服务',
			children: (
				<Suspense fallback={<Spin />}>
					<MCPServers robotId={props.robotId} />
				</Suspense>
			),
		},
		{
			key: 'skills',
			icon: <SkillsFilled />,
			label: 'Skills',
			children: (
				<Suspense fallback={<Spin />}>
					<Skills
						robotId={props.robotId}
						robot={data}
					/>
				</Suspense>
			),
		},
		{
			key: 'oss-settings',
			icon: <OSSFilled />,
			label: 'OSS设置',
			children: (
				<Suspense fallback={<Spin />}>
					<OSSSettings robotId={props.robotId} />
				</Suspense>
			),
		},
		{
			key: 'logs',
			icon: <FileTextFilled />,
			label: '容器日志',
			children: (
				<Suspense fallback={<Spin />}>
					<ContainerLog robotId={props.robotId} />
				</Suspense>
			),
		},
		{
			key: 'system-overview',
			icon: <FundFilled />,
			label: '系统概览',
			children: (
				<Suspense fallback={<Spin />}>
					<SystemOverview robotId={props.robotId} />
				</Suspense>
			),
		},
	];

	return (
		<Drawer
			title={
				<Row
					align="middle"
					wrap={false}
				>
					<Col flex="0 0 32px">
						<Avatar src={data.avatar} />
					</Col>
					<Col
						flex="0 1 auto"
						className="ellipsis"
						style={{ padding: '0 3px' }}
					>
						{data.nickname || data.wechat_id}
					</Col>
				</Row>
			}
			extra={
				<Space className="hide-on-mobile">
					<RestartRobotContainer
						robotId={data.id}
						robot={data}
						onRefresh={onRefresh}
					/>
					<RecreateRobotContainer
						robotId={data.id}
						onRefresh={onRefresh}
					/>
					<Remove
						robotId={data.id}
						robot={data}
						onRefresh={onRemoveRefresh}
						buttonText="删除机器人"
					/>
				</Space>
			}
			open={open}
			onClose={onClose}
			size="min(calc(100vw - 32px), max(calc(100vw - 300px), 750px))"
			styles={{ header: { paddingTop: 12, paddingBottom: 12 }, body: { padding: 0 } }}
			footer={null}
		>
			<Row
				style={{ height: '100%' }}
				wrap={false}
			>
				<Col
					flex="1 1 auto"
					style={{
						position: 'relative',
						borderRight: '1px solid rgb(240, 240, 240)',
						padding: '0 2px 0 24px',
					}}
				>
					<Tabs
						destroyOnHidden
						items={items}
					/>
				</Col>
				<Col
					flex="0 0 350px"
					className="hide-on-mobile"
					style={{ width: 350, height: '100%' }}
				>
					{loading ? (
						<Skeleton
							avatar
							active
							paragraph={{ rows: 4 }}
						/>
					) : (
						<BaseContainer>
							<div
								style={{
									height: '100%',
									overflow: 'hidden auto',
									flex: '1 1 auto',
								}}
							>
								<div className="title">基本信息</div>

								<BorderBeam
									className="base-info-beam"
									color={sciFiCyan}
									outset={0}
								>
									<div className="base-info-header">
										<Avatar
											src={data.avatar}
											size={44}
										/>
										<div
											className="base-info-profile"
											style={{ minWidth: 0 }}
										>
											<div
												className="ellipsis"
												style={{ fontSize: 15, fontWeight: 600, lineHeight: '22px' }}
											>
												{data.nickname || data.wechat_id || '未命名'}
											</div>
											<div style={{ marginTop: 2 }}>
												{data.status === 'online' ? (
													<Tag
														color={token.colorSuccess}
														style={{ margin: 0 }}
													>
														在线
													</Tag>
												) : (
													<Tag
														color="default"
														style={{ margin: 0 }}
													>
														离线
													</Tag>
												)}
											</div>
										</div>
									</div>
								</BorderBeam>

								<div className="base-info-card">
									<div className="base-info-card-title">账号信息</div>
									<InfoRow
										icon={<WechatFilled />}
										label="微信号"
									>
										{data.wechat_id || <Tag color="default">未绑定</Tag>}
									</InfoRow>
									<InfoRow
										icon={<UserOutlined />}
										label="昵称"
									>
										{data.nickname || <Tag color="default">未绑定</Tag>}
									</InfoRow>
									<InfoRow
										icon={<IdcardOutlined />}
										label="归属人"
									>
										{data.owner}
									</InfoRow>
									<InfoRow
										icon={<ClockCircleOutlined />}
										label="上次登录"
									>
										{data.last_login_at ? (
											dayjs(data.last_login_at * 1000).format('YYYY-MM-DD HH:mm:ss')
										) : (
											<Tag color="default">未登录</Tag>
										)}
									</InfoRow>
								</div>

								<div className="base-info-card">
									<div className="base-info-card-title">设备信息</div>
									<InfoRow
										icon={<DesktopOutlined />}
										label="设备ID"
									>
										{data.device_id}
									</InfoRow>
									<InfoRow
										icon={<TagOutlined />}
										label="设备名称"
									>
										{data.device_name}
									</InfoRow>
									<InfoRow
										icon={<DesktopOutlined />}
										label="设备类型"
									>
										{data.device_type}
									</InfoRow>
									<InfoRow
										icon={<QrcodeOutlined />}
										label="微信版本"
									>
										{data.wechat_version}
									</InfoRow>
								</div>

								<div className="base-info-card">
									<div className="base-info-card-title">实例信息</div>
									<InfoRow
										icon={<KeyOutlined />}
										label="机器人ID"
									>
										{data.id}
									</InfoRow>
									<InfoRow
										icon={<QrcodeOutlined />}
										label="机器人编码"
									>
										{data.robot_code}
									</InfoRow>
									<InfoRow
										icon={<TagOutlined />}
										label="机器人名称"
									>
										{data.robot_name}
									</InfoRow>
									<InfoRow
										icon={<DatabaseOutlined />}
										label="RDS"
									>
										{data.redis_db}
									</InfoRow>
								</div>

								{!!data.proxy?.ProxyIp && (
									<div className="base-info-card">
										<div className="base-info-card-title">代理信息</div>
										<InfoRow
											icon={<EnvironmentOutlined />}
											label="代理 IP"
										>
											{data.proxy.ProxyIp}
										</InfoRow>
										<InfoRow
											icon={<EnvironmentOutlined />}
											label="代理用户"
										>
											{data.proxy.ProxyUser}
										</InfoRow>
										<InfoRow
											icon={<EnvironmentOutlined />}
											label="代理密码"
										>
											{data.proxy.ProxyPassword}
										</InfoRow>
									</div>
								)}

								<div className="base-info-card">
									<InfoRow
										icon={<ClockCircleOutlined />}
										label="创建时间"
									>
										{dayjs(data.created_at * 1000).format('YYYY-MM-DD HH:mm:ss')}
									</InfoRow>
								</div>
							</div>
						</BaseContainer>
					)}
				</Col>
			</Row>
		</Drawer>
	);
};

export default React.memo(RobotDetail);
