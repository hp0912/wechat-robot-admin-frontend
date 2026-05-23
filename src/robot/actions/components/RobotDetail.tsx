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
import Contact from '@/contact';
import MCPFilled from '@/icons/MCPFilled';
import MomentsFilled from '@/icons/MomentsFilled';
import OSSFilled from '@/icons/OSSFilled';
import SkillsFilled from '@/icons/SkillsFilled';
import TextKnowledgeFilled from '@/icons/TextKnowledgeFilled';
import GlobalSettings from '@/settings';
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

const ContainerLog = React.lazy(() => import(/* webpackChunkName: "container-log" */ '@/container-log'));
const Moments = React.lazy(() => import(/* webpackChunkName: "moments" */ '@/moments'));
const SystemSettings = React.lazy(() => import(/* webpackChunkName: "system-settings" */ '@/system-settings'));
const KnowledgeBase = React.lazy(() => import(/* webpackChunkName: "knowledge-base" */ '@/knowledge-base'));
const MCPServers = React.lazy(() => import(/* webpackChunkName: "mcp-servers" */ '@/mcp-servers'));
const Skills = React.lazy(() => import(/* webpackChunkName: "skills" */ '@/skills'));
const OSSSettings = React.lazy(() => import(/* webpackChunkName: "oss-settings" */ '@/oss-settings'));
const SystemOverview = React.lazy(() => import(/* webpackChunkName: "system-overview" */ '@/system-overview'));


const sciFiCyan: BorderBeamColor = [
	{ color: '#06b6d4', percent: 0 },
	{ color: '#1677ff', percent: 50 },
	{ color: '#7c3aed', percent: 100 },
];

const BaseContainer = styled.div`
	display: flex;
	flex-direction: column;
	height: 100%;
	background: #fafbfc;

	.title {
		margin: 12px;
		padding: 8px 12px;
		border-radius: 12px;
		background: #fff;
		font-size: 14px;
		font-weight: 600;
	}

	.base-info-header {
		position: relative;
		display: flex;
		align-items: center;
		gap: 12px;
		margin: 12px;
		padding: 12px;
		background: linear-gradient(135deg, #f0f5ff 0%, #e6f4ff 100%);
		border-radius: 12px;
	}

	.base-info-card {
		position: relative;
		margin: 12px;
		background: linear-gradient(160deg, rgba(240, 249, 255, 0.9) 0%, rgba(245, 247, 255, 0.7) 100%);
		border-radius: 10px;
		padding: 12px;
		border: 1px solid rgba(22, 119, 255, 0.1);
		box-shadow: 0 0 20px rgba(22, 119, 255, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.6);
	}

	.base-info-card-title {
		font-size: 12px;
		font-weight: 600;
		color: rgba(22, 119, 255, 0.65);
		margin-bottom: 8px;
		letter-spacing: 0.5px;
	}

	.base-info-row {
		display: flex;
		align-items: flex-start;
		padding: 8px 0;
	}

	.base-info-row + .base-info-row {
		border-top: 1px solid rgba(22, 119, 255, 0.06);
	}

	.base-info-label {
		display: flex;
		align-items: center;
		gap: 6px;
		flex: 0 0 80px;
		font-size: 12px;
		color: rgba(0, 0, 0, 0.45);
		white-space: nowrap;
	}

	.base-info-label .anticon {
		font-size: 13px;
		color: #1677ff;
		opacity: 0.6;
	}

	.base-info-value {
		flex: 1 1 auto;
		font-size: 13px;
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

								<BorderBeam color={sciFiCyan}>
									<div className="base-info-header">
										<Avatar
											src={data.avatar}
											size={44}
										/>
										<div style={{ minWidth: 0 }}>
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
