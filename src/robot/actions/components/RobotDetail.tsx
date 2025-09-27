import { FileTextFilled, FundFilled, MacCommandFilled, OpenAIFilled, WechatFilled } from '@ant-design/icons';
import { useMemoizedFn, useRequest } from 'ahooks';
import { App, Avatar, Col, Drawer, Row, Skeleton, Space, Spin, Tabs, Tag, theme } from 'antd';
import type { TabsProps } from 'antd';
import dayjs from 'dayjs';
import React, { Suspense, useContext, useEffect } from 'react';
import styled from 'styled-components';
import Contact from '@/contact';
import { GlobalContext } from '@/context/global';
import MomentsFilled from '@/icons/MomentsFilled';
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
const SystemOverview = React.lazy(() => import(/* webpackChunkName: "system-overview" */ '@/system-overview'));

const BaseContainer = styled.div`
	display: flex;
	flex-direction: column;
	height: 100%;

	.title {
		margin: 12px 0;
		padding: 0 16px;
		font-size: 16px;
		font-weight: 600;
	}

	.base-info-item {
		margin-bottom: 24px;
	}

	.base-info-title,
	.base-info-value {
		font-size: 12px;
	}
`;

const RobotDetail = (props: IProps) => {
	const { message } = App.useApp();
	const { token } = theme.useToken();

	const globalContext = useContext(GlobalContext);

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
				globalContext.global?.isSmallScreen ? null : (
					<Space>
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
							onRefresh={onRemoveRefresh}
							buttonText="删除机器人"
						/>
					</Space>
				)
			}
			open={open}
			onClose={onClose}
			width={globalContext.global?.isSmallScreen ? '99%' : 'calc(100vw - 300px)'}
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
				{globalContext.global?.isSmallScreen ? null : (
					<Col
						flex="0 0 350px"
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
									<div style={{ padding: '0 16px', fontSize: 12, color: 'rgb(107, 107, 107)' }}>
										<Row
											className="base-info-item"
											align="middle"
											wrap={false}
										>
											<Col
												flex="0 0 100px"
												className="base-info-title"
											>
												微信号
											</Col>
											<Col
												flex="1 1 auto"
												className="ellipsis  base-info-value"
											>
												{data.wechat_id || <Tag color="gray">未绑定</Tag>}
											</Col>
										</Row>
										<Row
											className="base-info-item"
											align="middle"
											wrap={false}
										>
											<Col
												flex="0 0 100px"
												className="base-info-title"
											>
												昵称
											</Col>
											<Col
												flex="1 1 auto"
												className="ellipsis  base-info-value"
											>
												{data.nickname || <Tag color="gray">未绑定</Tag>}
											</Col>
										</Row>
										<Row
											className="base-info-item"
											align="middle"
											wrap={false}
										>
											<Col
												flex="0 0 100px"
												className="base-info-title"
											>
												状态
											</Col>
											<Col
												flex="1 1 auto"
												className="ellipsis base-info-value"
											>
												{data.status === 'online' ? (
													<Tag color={token.colorSuccess}>在线</Tag>
												) : (
													<Tag color="gray">离线</Tag>
												)}
											</Col>
										</Row>
										<Row
											className="base-info-item"
											align="middle"
											wrap={false}
										>
											<Col
												flex="0 0 100px"
												className="base-info-title"
											>
												上一次登陆时间
											</Col>
											<Col
												flex="1 1 auto"
												className="ellipsis base-info-value"
											>
												{data.last_login_at ? (
													dayjs(data.last_login_at * 1000).format('YYYY-MM-DD HH:mm:ss')
												) : (
													<Tag color="gray">未登录</Tag>
												)}
											</Col>
										</Row>
										<Row
											className="base-info-item"
											align="middle"
											wrap={false}
										>
											<Col
												flex="0 0 100px"
												className="base-info-title"
											>
												设备ID
											</Col>
											<Col
												flex="1 1 auto"
												className="ellipsis  base-info-value"
											>
												{data.device_id}
											</Col>
										</Row>
										<Row
											className="base-info-item"
											align="middle"
											wrap={false}
										>
											<Col
												flex="0 0 100px"
												className="base-info-title"
											>
												设备名称
											</Col>
											<Col
												flex="1 1 auto"
												className="ellipsis  base-info-value"
											>
												{data.device_name}
											</Col>
										</Row>
										<Row
											className="base-info-item"
											align="middle"
											wrap={false}
										>
											<Col
												flex="0 0 100px"
												className="base-info-title"
											>
												设备类型
											</Col>
											<Col
												flex="1 1 auto"
												className="ellipsis  base-info-value"
											>
												{data.device_type}
											</Col>
										</Row>
										<Row
											className="base-info-item"
											align="middle"
											wrap={false}
										>
											<Col
												flex="0 0 100px"
												className="base-info-title"
											>
												微信版本
											</Col>
											<Col
												flex="1 1 auto"
												className="ellipsis  base-info-value"
											>
												{data.wechat_version}
											</Col>
										</Row>
										<Row
											className="base-info-item"
											align="middle"
											wrap={false}
										>
											<Col
												flex="0 0 100px"
												className="base-info-title"
											>
												RDS
											</Col>
											<Col
												flex="1 1 auto"
												className="ellipsis  base-info-value"
											>
												{data.redis_db}
											</Col>
										</Row>
										<Row
											className="base-info-item"
											align="middle"
											wrap={false}
										>
											<Col
												flex="0 0 100px"
												className="base-info-title"
											>
												归属人
											</Col>
											<Col
												flex="1 1 auto"
												className="ellipsis  base-info-value"
											>
												{data.owner}
											</Col>
										</Row>
										<Row
											className="base-info-item"
											align="middle"
											wrap={false}
										>
											<Col
												flex="0 0 100px"
												className="base-info-title"
											>
												机器人ID
											</Col>
											<Col
												flex="1 1 auto"
												className="ellipsis  base-info-value"
											>
												{data.id}
											</Col>
										</Row>
										<Row
											className="base-info-item"
											align="middle"
											wrap={false}
										>
											<Col
												flex="0 0 100px"
												className="base-info-title"
											>
												机器人编码
											</Col>
											<Col
												flex="1 1 auto"
												className="ellipsis  base-info-value"
											>
												{data.robot_code}
											</Col>
										</Row>
										<Row
											className="base-info-item"
											align="middle"
											wrap={false}
										>
											<Col
												flex="0 0 100px"
												className="base-info-title"
											>
												创建时间
											</Col>
											<Col
												flex="1 1 auto"
												className="ellipsis base-info-value"
											>
												{dayjs(data.created_at * 1000).format('YYYY-MM-DD HH:mm:ss')}
											</Col>
										</Row>
									</div>
								</div>
							</BaseContainer>
						)}
					</Col>
				)}
			</Row>
		</Drawer>
	);
};

export default React.memo(RobotDetail);
