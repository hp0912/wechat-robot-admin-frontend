import { useRequest } from 'ahooks';
import { App, Form, Input, Modal } from 'antd';
import React from 'react';

interface IProps {
	robotId: number;
	open: boolean;
	onRefresh: () => void;
	onClose: () => void;
}

interface IFormValues {
	url?: string;
	repo_url?: string;
	sub_path?: string;
	ref?: string;
}

const InstallSkill = (props: IProps) => {
	const { message, modal } = App.useApp();

	const [form] = Form.useForm<IFormValues>();

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

	const { runAsync, loading } = useRequest(
		async (values: IFormValues) => {
			const resp = await window.wechatRobotClient.api.v1SkillsInstallCreate(
				{
					id: props.robotId,
				},
				values,
			);
			return resp.data?.data;
		},
		{
			manual: true,
			onSuccess: () => {
				modal.confirm({
					title: '安装成功',
					content: '需要重启客户端以启用技能，是否立即重启？',
					width: 350,
					okText: '立即重启',
					cancelText: '稍后重启',
					onOk: async () => {
						await onClientRestart();
						props.onRefresh();
						props.onClose();
					},
					onCancel: () => {
						props.onRefresh();
						props.onClose();
					},
				});
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	return (
		<Modal
			title="安装技能"
			width="min(550px, calc(100vw - 32px))"
			open={props.open}
			confirmLoading={loading}
			onOk={async () => {
				const values = await form.validateFields();
				await runAsync(values);
			}}
			okText="安装"
			onCancel={props.onClose}
		>
			<Form
				form={form}
				labelCol={{ flex: '0 0 85px' }}
				wrapperCol={{ flex: '1 1 auto' }}
				autoComplete="off"
			>
				<Form.Item
					name="url"
					label="安装地址"
					rules={[
						{ required: true, message: '请输入安装地址' },
						{ max: 512, message: '安装地址不能超过512个字符' },
					]}
					help={
						<>
							示例:{' '}
							<a
								href="https://github.com/anthropics/skills/tree/main/skills/pdf"
								target="_blank"
								rel="noopener noreferrer"
							>
								https://github.com/anthropics/skills/tree/main/skills/pdf
							</a>
						</>
					}
				>
					<Input
						placeholder="请输入安装地址"
						allowClear
					/>
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default React.memo(InstallSkill);
