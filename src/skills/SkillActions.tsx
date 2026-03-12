import { DeleteOutlined, GlobalOutlined, ReloadOutlined } from '@ant-design/icons';
import { useBoolean, useRequest } from 'ahooks';
import { App, Button, Space, Switch, Tooltip } from 'antd';
import React from 'react';
import type { Skill } from '@/api/wechat-robot/wechat-robot';
import SkillEnvs from './SkillEnvs';

interface IProps {
	robotId: number;
	skill: Skill;
	onRefresh: () => void;
}

const SkillActions = (props: IProps) => {
	const { message, modal } = App.useApp();

	const [onSkillEnvsOpen, setSkillEnvsOpen] = useBoolean(false);

	const { runAsync: onClientRestart } = useRequest(
		async () => {
			await window.wechatRobotClient.api.v1RobotRestartClientCreate({
				id: props.robotId,
			});
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
			const resp = await window.wechatRobotClient.api.v1SkillsUpdateUpdate(
				{
					id: props.robotId,
				},
				{
					name: props.skill.metadata.name,
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
			const resp = await window.wechatRobotClient.api.v1SkillsEnableCreate(
				{
					id: props.robotId,
				},
				{
					name: props.skill.metadata.name,
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
			const resp = await window.wechatRobotClient.api.v1SkillsDisableCreate(
				{
					id: props.robotId,
				},
				{
					name: props.skill.metadata.name,
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
			const resp = await window.wechatRobotClient.api.v1SkillsUninstallDelete(
				{
					id: props.robotId,
				},
				{
					name: props.skill.metadata.name,
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
							content: '确认更新这个技能？',
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
							content: '确认启用这个技能？',
							width: 350,
							onOk: async () => {
								await onEnable();
							},
						});
					} else {
						modal.confirm({
							title: '禁用技能',
							content: '确认禁用这个技能？',
							width: 350,
							onOk: async () => {
								await onDisable();
							},
						});
					}
				}}
			/>
			{onSkillEnvsOpen && (
				<SkillEnvs
					open={onSkillEnvsOpen}
					robotId={props.robotId}
					skill={props.skill}
					onRefresh={props.onRefresh}
					onClose={setSkillEnvsOpen.setFalse}
				/>
			)}
		</Space>
	);
};

export default React.memo(SkillActions);
