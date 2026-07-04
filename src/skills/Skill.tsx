import {
	CheckCircleOutlined,
	ClockCircleOutlined,
	DeleteOutlined,
	GlobalOutlined,
	OpenAIOutlined,
	ReloadOutlined,
	StopOutlined,
} from '@ant-design/icons';
import { useBoolean, useRequest } from 'ahooks';
import { App, Avatar, Button, Card, Space, Switch, theme, Tooltip, Typography } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import type { DtoSkill } from '@/api/wechat-robot/wechat-robot';
import SkillsFilled from '@/icons/SkillsFilled';
import SkillEnvs from './SkillEnvs';
import {
	SkillFooter,
	SkillMetaContent,
	SkillMetaGrid,
	SkillMetaIcon,
	SkillMetaItem,
	SkillMetaLabel,
	SkillMetaLink,
	SkillMetaValue,
	SkillName,
	SkillStatusGroup,
	SkillStatusTag,
	SkillTitle,
} from './styled';

interface IProps {
	robotId: number;
	skill: DtoSkill;
	onRefresh: () => void;
}

const Skill = (props: IProps) => {
	const { token } = theme.useToken();
	const { message, modal } = App.useApp();

	const [onSkillEnvsOpen, setSkillEnvsOpen] = useBoolean(false);

	const { runAsync: onClientRestart } = useRequest(
		async () => {
			await window.wechatRobotClient.robot.restartClientCreate(
				{ id: props.robotId },
				{
					id: props.robotId,
				},
			);
		},
		{
			manual: true,
			onSuccess: () => {
				message.success('重启客户端成功');
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	const { runAsync: onUpdate, loading: updateLoading } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.skills.updateUpdate(
				{
					id: props.robotId,
				},
				{
					name: props.skill.metadata?.name || '',
				},
			);
			return resp.data?.data;
		},
		{
			manual: true,
			onSuccess: () => {
				modal.confirm({
					title: '更新成功',
					content: '需要重启客户端以启用技能，是否立即重启？',
					width: 400,
					okText: '立即重启',
					cancelText: '稍后重启',
					onOk: async () => {
						await onClientRestart();
						await new Promise(resolve => setTimeout(resolve, 4000));
						props.onRefresh();
					},
					onCancel: () => {
						props.onRefresh();
					},
				});
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	const { runAsync: onEnable, loading: enableLoading } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.skills.enableCreate(
				{
					id: props.robotId,
				},
				{
					name: props.skill.metadata?.name || '',
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
			const resp = await window.wechatRobotClient.skills.disableCreate(
				{
					id: props.robotId,
				},
				{
					name: props.skill.metadata?.name || '',
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

	const { runAsync: onUninstall, loading: uninstallLoading } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.skills.uninstallDelete(
				{
					id: props.robotId,
				},
				{
					name: props.skill.metadata?.name || '',
				},
			);
			return resp.data?.data;
		},
		{
			manual: true,
			onSuccess: () => {
				message.success('卸载成功');
				props.onRefresh();
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	const sourceText = props.skill.source?.repo_url || (props.skill.path ? '本地安装' : '-');
	const sourceTypeText = props.skill.source?.type === 'git' ? 'Git' : props.skill.path ? '本地' : '未知';
	const installedAtText = props.skill.installed_at
		? dayjs(props.skill.installed_at).format('YYYY-MM-DD HH:mm:ss')
		: '-';
	const envCount = props.skill.env_vars?.length || 0;

	return (
		<Card
			title={
				<SkillTitle>
					<Avatar
						style={{
							backgroundColor: props.skill.enabled ? 'var(--ant-color-primary)' : token.colorTextDisabled,
							boxShadow: props.skill.enabled ? 'var(--app-shadow-icon-accent)' : 'none',
						}}
						shape="square"
						icon={<SkillsFilled />}
					/>
					<SkillName>{props.skill.metadata?.name}</SkillName>
				</SkillTitle>
			}
			size="medium"
			styles={{
				root: props.skill.enabled
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
				props.skill.enabled ? (
					<SkillStatusTag
						$tone="success"
						icon={<CheckCircleOutlined />}
					>
						启用中
					</SkillStatusTag>
				) : (
					<SkillStatusTag
						$tone="neutral"
						icon={<StopOutlined />}
					>
						已停用
					</SkillStatusTag>
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
						{props.skill.metadata?.description}
					</Typography.Paragraph>
				}
			/>
			<div>
				<SkillMetaGrid>
					<SkillMetaItem>
						<SkillMetaIcon>
							<OpenAIOutlined />
						</SkillMetaIcon>
						<SkillMetaContent>
							<SkillMetaLabel>来源</SkillMetaLabel>
							{props.skill.source?.repo_url ? (
								<SkillMetaLink
									href={props.skill.source.repo_url}
									target="_blank"
									rel="noreferrer"
									title={sourceText}
								>
									{sourceText}
								</SkillMetaLink>
							) : (
								<SkillMetaValue title={sourceText}>{sourceText}</SkillMetaValue>
							)}
						</SkillMetaContent>
					</SkillMetaItem>
					<SkillMetaItem>
						<SkillMetaIcon>
							<ClockCircleOutlined />
						</SkillMetaIcon>
						<SkillMetaContent>
							<SkillMetaLabel>安装时间</SkillMetaLabel>
							<SkillMetaValue title={installedAtText}>{installedAtText}</SkillMetaValue>
						</SkillMetaContent>
					</SkillMetaItem>
				</SkillMetaGrid>
				<SkillFooter>
					<SkillStatusGroup>
						<SkillStatusTag $tone={props.skill.source?.type === 'git' ? 'info' : 'neutral'}>
							{sourceTypeText}
						</SkillStatusTag>
						{envCount > 0 ? <SkillStatusTag $tone="info">环境变量 {envCount}</SkillStatusTag> : null}
					</SkillStatusGroup>
					<Space size={8}>
						{!props.skill?.enabled && (
							<Tooltip title="卸载">
								<Button
									type="primary"
									danger
									ghost
									size="small"
									loading={uninstallLoading}
									icon={<DeleteOutlined />}
									onClick={() => {
										modal.confirm({
											title: '卸载技能',
											content: '确认卸载这个技能？',
											width: 350,
											onOk: async () => {
												await onUninstall();
											},
										});
									}}
								/>
							</Tooltip>
						)}
						<Tooltip title="环境变量">
							<Button
								type="primary"
								ghost
								size="small"
								icon={<GlobalOutlined />}
								onClick={setSkillEnvsOpen.setTrue}
							/>
						</Tooltip>
						<Tooltip title="更新技能">
							<Button
								type="primary"
								ghost
								size="small"
								icon={<ReloadOutlined />}
								loading={updateLoading}
								onClick={() => {
									modal.confirm({
										title: '更新技能',
										content: (
											<>
												确认更新技能<b>{props.skill.metadata?.name || ''}</b>吗？
											</>
										),
										width: 350,
										onOk: async () => {
											await onUpdate();
										},
									});
								}}
							/>
						</Tooltip>
						<Switch
							checkedChildren="启用"
							unCheckedChildren="禁用"
							checked={props.skill?.enabled}
							loading={enableLoading || disableLoading}
							onChange={checked => {
								if (checked) {
									modal.confirm({
										title: '启用技能',
										content: (
											<>
												确认启用技能<b>{props.skill.metadata?.name || ''}</b>吗？
											</>
										),
										width: 350,
										onOk: async () => {
											await onEnable();
										},
									});
								} else {
									modal.confirm({
										title: '禁用技能',
										content: (
											<>
												确认禁用技能<b>{props.skill.metadata?.name || ''}</b>吗？
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
				</SkillFooter>
			</div>
			{onSkillEnvsOpen && (
				<SkillEnvs
					open={onSkillEnvsOpen}
					robotId={props.robotId}
					skill={props.skill}
					onRefresh={props.onRefresh}
					onClose={setSkillEnvsOpen.setFalse}
				/>
			)}
		</Card>
	);
};

export default React.memo(Skill);
