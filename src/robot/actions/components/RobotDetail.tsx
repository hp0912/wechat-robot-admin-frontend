import {
	AliwangwangFilled,
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
import { App, Avatar, Col, ConfigProvider, Drawer, Row, Skeleton, Space, Spin, Tabs, Tag, theme } from 'antd';
import type { TabsProps } from 'antd';
import dayjs from 'dayjs';
import React, { Suspense, useEffect } from 'react';
import MCPFilled from '@/icons/MCPFilled';
import MomentsFilled from '@/icons/MomentsFilled';
import OSSFilled from '@/icons/OSSFilled';
import SkillsFilled from '@/icons/SkillsFilled';
import TextKnowledgeFilled from '@/icons/TextKnowledgeFilled';
import GlobalSettings from '@/settings';
import RecreateRobotContainer from '../RecreateRobotContainer';
import Remove from '../Remove';
import RestartRobotContainer from '../RestartRobotContainer';
import { BaseContainer, LeftPanel } from './RobotDetail.styled';

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
const SystemPrompts = React.lazy(() => import(/* webpackChunkName: "system-prompts" */ '@/system-prompts'));

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
			const resp = await window.wechatRobotClient.robot.viewList({
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
			key: 'system-prompts',
			icon: <AliwangwangFilled />,
			label: '人设管理',
			children: (
				<Suspense fallback={<Spin />}>
					<SystemPrompts robotId={props.robotId} />
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
						<Avatar
							src={data.avatar}
							style={{ boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.92)' }}
						/>
					</Col>
					<Col
						flex="0 1 auto"
						className="ellipsis"
						style={{ padding: '0 8px', fontWeight: 600, color: '#0958d9' }}
					>
						{data.nickname || data.wechat_id}
					</Col>
					<Col flex="0 0 auto">
						<Tag
							color={data.status === 'online' ? token.colorSuccess : 'default'}
							style={{ margin: 0 }}
						>
							{data.status === 'online' ? '在线' : '离线'}
						</Tag>
					</Col>
				</Row>
			}
			extra={
				<Space className="hide-on-mobile">
					<RestartRobotContainer
						robotId={data.id!}
						robot={data}
						onRefresh={onRefresh}
					/>
					<RecreateRobotContainer
						robotId={data.id!}
						onRefresh={onRefresh}
					/>
					<Remove
						robotId={data.id!}
						robot={data}
						onRefresh={onRemoveRefresh}
						buttonText="删除机器人"
					/>
				</Space>
			}
			open={open}
			onClose={onClose}
			size="min(calc(100vw - 32px), max(calc(100vw - 300px), 750px))"
			styles={{
				header: {
					paddingTop: 8,
					paddingBottom: 8,
					background: '#ffffff',
					borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
				},
				body: { padding: 0 },
			}}
			footer={null}
		>
			<ConfigProvider
				theme={{
					token: {
						colorBorderSecondary: 'rgba(15, 23, 42, 0.08)',
					},
					components: {
						Tabs: {
							itemColor: 'rgba(0, 42, 76, 0.62)',
							itemHoverColor: '#0958d9',
							itemSelectedColor: '#0958d9',
							itemActiveColor: '#0958d9',
							inkBarColor: '#22d3ee',
						},
						Card: {
							boxShadowTertiary: '0 1px 2px rgba(15, 23, 42, 0.04), 0 6px 16px rgba(22, 119, 255, 0.04)',
							colorBorderSecondary: 'rgba(15, 23, 42, 0.08)',
						},
						List: {
							colorBorder: 'rgba(15, 23, 42, 0.08)',
						},
						Segmented: {
							itemSelectedBg: '#1677ff',
							itemSelectedColor: '#ffffff',
						},
					},
				}}
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
						<LeftPanel>
							<Tabs
								destroyOnHidden
								items={items}
								classNames={{
									header: 'tech-tabs-header',
									item: 'tech-tabs-item',
									indicator: 'tech-tabs-indicator',
									content: 'tech-tabs-content',
								}}
							/>
						</LeftPanel>
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
								<div className="base-info-scroll">
									<div className="title">基本信息</div>

									<div className="base-info-header">
										<Avatar
											src={data.avatar}
											size={44}
											style={{ boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.92)' }}
										/>
										<div className="base-info-profile">
											<div className="ellipsis base-info-name">{data.nickname || data.wechat_id || '未命名'}</div>
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
											{dayjs((data.created_at || 0) * 1000).format('YYYY-MM-DD HH:mm:ss')}
										</InfoRow>
									</div>
								</div>
							</BaseContainer>
						)}
					</Col>
				</Row>
			</ConfigProvider>
		</Drawer>
	);
};

export default React.memo(RobotDetail);
