import { EditFilled } from '@ant-design/icons';
import { useBoolean, useRequest, useUpdateEffect } from 'ahooks';
import { App, Avatar, Button, Flex, Tooltip } from 'antd';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import type * as Api from '@/api/wechat-robot/wechat-robot';
import Login from './actions/Login';
import Logout from './actions/Logout';
import Remove from './actions/Remove';
import RestartClient from './actions/RestartClient';
import RestartServer from './actions/RestartServer';
import RobotMetadata from './actions/RobotMetadata';
import RobotEditor from './RobotEditor';
import {
	ActionSlot,
	AvatarShell,
	CardContent,
	Hero,
	InfoGrid,
	InfoItem,
	InfoLabel,
	InfoValue,
	RobotTitleRow,
	StatusTag,
	StyledCard,
	TitleText,
} from './styled';

interface IProps {
	robot: NonNullable<NonNullable<Api.Robot.ListList.ResponseBody['data']>['items']>[number];
	onRefresh: () => void;
}

const statusMap = {
	online: {
		label: '在线',
		accent: 'var(--ant-color-success)',
		heroStart: 'var(--ant-color-success-bg)',
		heroEnd: 'var(--ant-color-primary-bg)',
		tagBg: 'var(--ant-color-success-bg)',
		tagBorder: 'var(--ant-color-success-border)',
		tagColor: 'var(--ant-color-success-text)',
	},
	offline: {
		label: '离线',
		accent: 'var(--ant-color-text-secondary)',
		heroStart: 'var(--ant-color-fill-content)',
		heroEnd: 'var(--ant-color-fill-alter)',
		tagBg: 'var(--ant-color-fill-quaternary)',
		tagBorder: 'var(--ant-color-border)',
		tagColor: 'var(--ant-color-text-secondary)',
	},
	error: {
		label: '错误',
		accent: 'var(--ant-color-error)',
		heroStart: 'var(--ant-color-error-bg)',
		heroEnd: 'var(--ant-color-warning-bg)',
		tagBg: 'var(--ant-color-error-bg)',
		tagBorder: 'var(--ant-color-error-border)',
		tagColor: 'var(--ant-color-error-text)',
	},
} as const;

const defaultStatus = statusMap.offline;

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
			const resp = await window.wechatRobotClient.robot.viewList({
				id: robot.id!,
			});
			return resp.data?.data;
		},
		{
			manual: true,
			onSuccess: resp => {
				if (resp) {
					setRobot(resp);
				}
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
					robotId={robot.id!}
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
					robotId={robot.id!}
					robot={robot}
					onRefresh={refresh}
				/>,
				<RestartServer
					key="restart-server"
					robotId={robot.id!}
					robot={robot}
					onRefresh={refresh}
				/>,
				<Remove
					key="remove"
					robotId={robot.id!}
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
				<Hero>
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
							<AvatarShell>
								<Avatar
									src={robot.avatar}
									size={56}
								/>
							</AvatarShell>
							<div style={{ minWidth: 0, flex: 1 }}>
								<RobotTitleRow>
									<TitleText>{displayName}</TitleText>
									<StatusTag
										$bg={statusConfig.tagBg}
										$border={statusConfig.tagBorder}
										$color={statusConfig.tagColor}
									>
										{statusConfig.label}
									</StatusTag>
								</RobotTitleRow>
							</div>
						</Flex>
						<ActionSlot>
							{isOnline ? (
								<Logout
									robotId={robot.id!}
									onRefresh={refresh}
								/>
							) : (
								<Login
									robotId={robot.id!}
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
					robotId={robot.id!}
					onRefresh={refresh}
					onClose={setEditOpen.setFalse}
				/>
			)}
		</StyledCard>
	);
};

export default React.memo(Robot);
