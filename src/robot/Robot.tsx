import { EditFilled } from '@ant-design/icons';
import { useBoolean, useRequest, useUpdateEffect } from 'ahooks';
import { App, Avatar, Button, Card, Flex, Tooltip } from 'antd';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import styled from 'styled-components';
import type { Api } from '@/api/wechat-robot/wechat-robot';
import Login from './actions/Login';
import Logout from './actions/Logout';
import Remove from './actions/Remove';
import RestartClient from './actions/RestartClient';
import RestartServer from './actions/RestartServer';
import RobotMetadata from './actions/RobotMetadata';
import RobotEditor from './RobotEditor';

interface IProps {
	robot: Api.V1RobotListList.ResponseBody['data']['items'][number];
	onRefresh: () => void;
}

const statusMap = {
	online: {
		accent: '#16a34a',
		heroStart: 'rgba(22, 163, 74, 0.2)',
		heroEnd: 'rgba(14, 116, 144, 0.14)',
	},
	offline: {
		accent: '#64748b',
		heroStart: 'rgba(100, 116, 139, 0.12)',
		heroEnd: 'rgba(148, 163, 184, 0.08)',
	},
	error: {
		accent: '#ef4444',
		heroStart: 'rgba(239, 68, 68, 0.18)',
		heroEnd: 'rgba(251, 146, 60, 0.12)',
	},
} as const;

const defaultStatus = statusMap.offline;

const StyledCard = styled(Card)<{
	$accent: string;
	$heroStart: string;
	$heroEnd: string;
}>`
	position: relative;
	overflow: hidden;
	width: 100%;
	border: 1.5px solid rgba(148, 163, 184, 0.35);
	border-radius: 22px;
	background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(249, 250, 251, 0.96));
	box-shadow: 0 16px 40px rgba(15, 23, 42, 0.07);
	transition:
		box-shadow 0.24s ease,
		border-color 0.24s ease;

	&::before {
		content: '';
		position: absolute;
		inset: 0 0 auto;
		height: 96px;
		background: linear-gradient(135deg, ${({ $heroStart }) => $heroStart}, ${({ $heroEnd }) => $heroEnd});
		pointer-events: none;
	}

	&:hover {
		border-color: ${({ $accent }) => `${$accent}80`};
		box-shadow: 0 20px 48px rgba(15, 23, 42, 0.11);
	}

	.ant-card-body {
		position: relative;
		padding: 0;
	}

	.ant-card-actions {
		position: relative;
		margin: 0 16px 16px;
		padding: 8px 6px;
		border: 1px solid rgba(148, 163, 184, 0.16);
		border-radius: 16px;
		background: rgba(255, 255, 255, 0.94);
	}

	.ant-card-actions > li {
		margin: 0;
	}

	.ant-card-actions > li:not(:last-child) {
		border-inline-end: 1px solid rgba(148, 163, 184, 0.16);
	}

	.ant-card-actions > li > span {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 32px;
		border-radius: 10px;
		color: #475569;
		transition: color 0.2s ease;
	}

	.ant-card-actions > li > span:hover {
		color: ${({ $accent }) => $accent};
	}
`;

const CardContent = styled.div`
	position: relative;
	padding: 16px 16px 12px;
`;

const Hero = styled.div<{
	$heroStart: string;
	$heroEnd: string;
}>`
	position: relative;
	padding: 14px 14px 12px;
	border-radius: 18px;
	background: linear-gradient(180deg, rgba(255, 255, 255, 0.76), rgba(255, 255, 255, 0.96));
	border: 1px solid rgba(255, 255, 255, 0.72);
`;

const AvatarShell = styled.div<{
	$accent: string;
}>`
	position: relative;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: 3px;
	border-radius: 18px;
	background: linear-gradient(145deg, ${({ $accent }) => `${$accent}22`}, rgba(255, 255, 255, 0.98));
`;

const TitleText = styled.div`
	display: block;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	font-size: 18px;
	font-weight: 700;
	line-height: 1.2;
	color: #0f172a;
`;

const InfoGrid = styled.div`
	display: flex;
	flex-direction: column;
	gap: 10px;
	margin-top: 12px;
`;

const InfoItem = styled.div`
	display: grid;
	grid-template-columns: 84px minmax(0, 1fr);
	align-items: start;
	gap: 12px;
	min-width: 0;
	padding: 0;

	&:not(:last-child) {
		padding-bottom: 10px;
		border-bottom: 1px solid rgba(148, 163, 184, 0.16);
	}
`;

const InfoLabel = styled.div`
	font-size: 11px;
	font-weight: 600;
	letter-spacing: 0.04em;
	line-height: 1.75;
	color: #94a3b8;
`;

const InfoValue = styled.div`
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	font-size: 13px;
	font-weight: 600;
	line-height: 1.5;
	color: #1e293b;
`;

const ActionSlot = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
`;

const Robot = (props: IProps) => {
	const { message } = App.useApp();

	const [robot, setRobot] = useState(props.robot);
	const [editOpen, setEditOpen] = useBoolean(false);

	const statusConfig = statusMap[robot.status as keyof typeof statusMap] || defaultStatus;
	const isOnline = robot.status === 'online';
	const displayName = isOnline ? robot.nickname || robot.robot_name || '微信机器人' : '未登录';
	const lastLoginText = robot.last_login_at ? dayjs(robot.last_login_at * 1000).format('YYYY-MM-DD HH:mm:ss') : '-';

	const { refresh } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1RobotViewList({
				id: robot.id,
			});
			return resp.data?.data;
		},
		{
			manual: true,
			onSuccess: resp => {
				setRobot(resp);
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	useUpdateEffect(() => {
		setRobot(props.robot);
	}, [props.robot]);

	return (
		<StyledCard
			loading={false}
			actions={[
				<RobotMetadata
					key="meta"
					robotId={robot.id}
					robot={robot}
					onListRefresh={props.onRefresh}
					onDetailRefresh={refresh}
				/>,
				<Tooltip
					key="edit"
					title="编辑机器人"
				>
					<Button
						type="text"
						icon={<EditFilled />}
						onClick={setEditOpen.setTrue}
					/>
				</Tooltip>,
				<RestartClient
					key="restart-client"
					robotId={robot.id}
					robot={robot}
					onRefresh={refresh}
				/>,
				<RestartServer
					key="restart-server"
					robotId={robot.id}
					robot={robot}
					onRefresh={refresh}
				/>,
				<Remove
					key="remove"
					robotId={robot.id}
					robot={robot}
					onRefresh={props.onRefresh}
				/>,
			]}
			$accent={statusConfig.accent}
			$heroStart={statusConfig.heroStart}
			$heroEnd={statusConfig.heroEnd}
			key={robot.id}
		>
			<CardContent>
				<Hero
					$heroStart={statusConfig.heroStart}
					$heroEnd={statusConfig.heroEnd}
				>
					<Flex
						align="flex-start"
						justify="space-between"
						gap={12}
						style={{ marginTop: 2 }}
					>
						<Flex
							align="center"
							gap={12}
							style={{ minWidth: 0, flex: 1 }}
						>
							<AvatarShell $accent={statusConfig.accent}>
								<Avatar
									src={robot.avatar}
									size={56}
								/>
							</AvatarShell>
							<div style={{ minWidth: 0, flex: 1 }}>
								<div className="ellipsis">
									<TitleText>{displayName}</TitleText>
								</div>
							</div>
						</Flex>
						<ActionSlot>
							{isOnline ? (
								<Logout
									robotId={robot.id}
									onRefresh={refresh}
								/>
							) : (
								<Login
									robotId={robot.id}
									robot={robot}
									onRefresh={refresh}
								/>
							)}
						</ActionSlot>
					</Flex>
					<InfoGrid>
						<InfoItem>
							<InfoLabel>机器人名称</InfoLabel>
							<InfoValue>{robot.robot_name || '-'}</InfoValue>
						</InfoItem>
						<InfoItem>
							<InfoLabel>微信号</InfoLabel>
							<InfoValue>{robot.wechat_id || '-'}</InfoValue>
						</InfoItem>
						<InfoItem>
							<InfoLabel>最近登录</InfoLabel>
							<InfoValue>{lastLoginText}</InfoValue>
						</InfoItem>
					</InfoGrid>
				</Hero>
			</CardContent>
			{editOpen && (
				<RobotEditor
					key="editor"
					open={editOpen}
					robotId={robot.id}
					onRefresh={refresh}
					onClose={setEditOpen.setFalse}
				/>
			)}
		</StyledCard>
	);
};

export default React.memo(Robot);
