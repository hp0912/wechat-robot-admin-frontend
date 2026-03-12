import { useRequest } from 'ahooks';
import { App, Form, Modal } from 'antd';
import React, { useEffect } from 'react';
import type { EnvVar, Skill } from '@/api/wechat-robot/wechat-robot';
import EnvEditor from './EnvEditor';

interface IProps {
	open?: boolean;
	robotId: number;
	skill: Skill;
	onRefresh: () => void;
	onClose: () => void;
}

interface IFormValues {
	name: string;
	env_vars: EnvVar[];
}

const SkillEnvs = (props: IProps) => {
	const { message } = App.useApp();

	const [form] = Form.useForm<IFormValues>();

	useEffect(() => {
		if (props.open) {
			const envs = props.skill.env_vars || [];
			try {
				form.setFieldsValue({
					env_vars: JSON.stringify(envs, null, 2) as unknown as EnvVar[],
				});
			} catch {
				//
			}
		}
	}, []);

	const { runAsync, loading } = useRequest(
		async (values: IFormValues) => {
			const resp = await window.wechatRobotClient.api.v1SkillsEnvsCreate(
				{
					id: props.robotId,
				},
				{
					name: props.skill.metadata.name,
					env_vars: values.env_vars,
				},
			);
			return resp.data?.data;
		},
		{
			manual: true,
			onSuccess: () => {
				message.success('保存成功');
				props.onRefresh();
				props.onClose();
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	return (
		<Modal
			title="技能环境变量"
			width="min(500px, calc(100vw - 32px))"
			open={props.open}
			confirmLoading={loading}
			onOk={async () => {
				const values = await form.validateFields();
				const envs = values.env_vars as unknown as string;
				try {
					if (envs?.trim()) {
						values.env_vars = JSON.parse(envs);
					} else {
						values.env_vars = [];
					}
				} catch {
					message.error('环境变量格式错误，请检查后重试');
					return;
				}
				await runAsync(values);
			}}
			onCancel={props.onClose}
		>
			<Form
				form={form}
				autoComplete="off"
			>
				<Form.Item name="env_vars">
					<EnvEditor />
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default React.memo(SkillEnvs);
