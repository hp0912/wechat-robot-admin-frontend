import {
	CheckCircleOutlined,
	ClockCircleOutlined,
	CodeOutlined,
	DeleteOutlined,
	GlobalOutlined,
	OpenAIOutlined,
	ReloadOutlined,
	StopOutlined,
} from '@ant-design/icons';
import { useBoolean, useRequest } from 'ahooks';
import { App, Avatar, Button, Card, Flex, Space, Switch, Tag, theme, Tooltip, Typography } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import type { DtoSkill } from '@/api/wechat-robot/wechat-robot';
import SkillEnvs from './SkillEnvs';

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

	return (
		<Card
			title={
				<>
					<Avatar
						style={{
							marginRight: 8,
							backgroundColor: props.skill.enabled ? '#08979c' : token.colorTextDisabled,
						}}
						shape="square"
						icon={<CodeOutlined />}
					/>
					{props.skill.metadata?.name}
				</>
			}
			size="medium"
			styles={{
				root: props.skill.enabled
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
				props.skill.enabled ? (
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
						{props.skill.metadata?.description}
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
						<OpenAIOutlined style={{ marginRight: 4 }} />
						来源
					</Flex>
					<Flex
						flex="1 1 auto"
						className="ellipsis"
					>
						<a
							href={props.skill.source?.repo_url}
							target="_blank"
							rel="noreferrer"
						>
							{props.skill.source?.repo_url}
						</a>
					</Flex>
				</Flex>
				<Flex
					justify="start"
					align="center"
				>
					<Flex flex="0 0 90px">
						<ClockCircleOutlined style={{ marginRight: 4 }} />
						安装时间
					</Flex>
					<Flex flex="1 1 auto">{dayjs(props.skill.installed_at).format('YYYY-MM-DD HH:mm:ss')}</Flex>
				</Flex>
				<Flex
					justify="end"
					align="center"
				>
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
				</Flex>
			</Flex>
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
