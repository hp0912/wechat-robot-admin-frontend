import { useMemoizedFn, useRequest } from 'ahooks';
import { Alert, App, Button, Empty, Form, Input, Modal, Select, Tabs } from 'antd';
import React, { useState } from 'react';
import type * as Api from '@/api/wechat-robot/wechat-robot';
import ContainerLog from '@/container-log';

interface IProps {
	open: boolean;
	onSuccess: () => void;
	onClose: () => void;
	onRefresh: () => void;
}

const NewRobot = (props: IProps) => {
	const { message } = App.useApp();

	const [form] = Form.useForm<Api.Robot.CreateCreate.RequestBody>();
	const [createFailure, setCreateFailure] = useState<{ robotId?: number; message: string }>();

	const { run: createRobot, loading: createLoading } = useRequest(
		async (data: Api.Robot.CreateCreate.RequestBody) => {
			const resp = await window.wechatRobotClient.robot.createCreate(data);
			return resp.data;
		},
		{
			manual: true,
			onSuccess: () => {
				message.success('创建成功');
				props.onSuccess();
				props.onRefresh();
				props.onClose();
			},
			onError: reason => {
				const response = (reason as Error & { meta?: Api.Robot.CreateCreate.ResponseBody }).meta;
				const robotId = response?.data?.id;
				setCreateFailure({ robotId, message: reason.message });
				if (robotId) {
					props.onRefresh();
				}
			},
		},
	);

	const onCreate = useMemoizedFn((values: Api.Robot.CreateCreate.RequestBody) => {
		if (createLoading || createFailure) {
			return;
		}
		if (values.proxy?.ProxyIp === '' && values.proxy.ProxyUser === '' && values.proxy.ProxyPassword === '') {
			//
		} else if (values.proxy?.ProxyIp === '' || values.proxy?.ProxyUser === '' || values.proxy?.ProxyPassword === '') {
			message.error('请完整填写代理信息，或者全部留空');
			return;
		}
		createRobot(values);
	});

	const onOk = useMemoizedFn(() => form.submit());
	const onFailureClose = useMemoizedFn(() => {
		if (createFailure?.robotId) {
			props.onClose();
			return;
		}
		setCreateFailure(undefined);
	});

	return (
		<>
			<Modal
				title="创建机器人"
				open={props.open}
				okText="创建"
				onOk={onOk}
				confirmLoading={createLoading}
				onCancel={props.onClose}
				closable={!createLoading}
				keyboard={!createLoading}
				mask={{ closable: !createLoading }}
				cancelButtonProps={{ disabled: createLoading }}
			>
				<Form
					layout="vertical"
					form={form}
					onFinish={onCreate}
					autoComplete="off"
					scrollToFirstError={{ behavior: 'instant', block: 'end', focus: true }}
				>
					<Form.Item
						name="robot_name"
						label="机器人名称"
						rules={[
							{ required: true, message: '机器人名称不能为空' },
							{ min: 2, message: '机器人名称至少输入2个字符' },
							{ max: 12, message: '机器人名称不能超过12个字符' },
						]}
					>
						<Input
							placeholder="请输入机器人名称"
							allowClear
						/>
					</Form.Item>
					<Form.Item
						name="version"
						label="协议版本"
						rules={[{ required: true, message: '协议版本不能为空' }]}
						initialValue="8.0.59"
						help={
							<>
								<span style={{ color: '#e45c5c' }}>温馨提示: </span>:
								<span style={{ fontSize: 12 }}>
									优先使用 8.0.59 版本，如果 8.0.59 登录不上，再重新创建一个机器人，使用 8.0.74
									版本，机器人创建成功以后不支持切换协议版本
								</span>
							</>
						}
					>
						<Select
							options={[
								{ label: '8.0.59', value: '8.0.59' },
								{ label: '8.0.74', value: '8.0.74' },
							]}
						/>
					</Form.Item>
					<Form.Item
						name={['proxy', 'ProxyIp']}
						label="代理 IP"
						rules={[{ max: 15, message: '代理 IP 不能超过 15 个字符' }]}
						help="如果不使用代理，请留空"
					>
						<Input
							placeholder="请输入代理 IP"
							allowClear
						/>
					</Form.Item>
					<Form.Item
						name={['proxy', 'ProxyUser']}
						label="代理用户名"
						rules={[{ max: 64, message: '代理用户名不能超过 64 个字符' }]}
						help="如果不使用代理，请留空"
					>
						<Input
							placeholder="请输入代理用户名"
							allowClear
						/>
					</Form.Item>
					<Form.Item
						name={['proxy', 'ProxyPassword']}
						label="代理密码"
						rules={[{ max: 64, message: '代理密码不能超过 64 个字符' }]}
						help="如果不使用代理，请留空"
					>
						<Input
							placeholder="请输入代理密码"
							allowClear
						/>
					</Form.Item>
				</Form>
			</Modal>
			{createFailure && (
				<Modal
					open
					title="创建机器人失败"
					width="min(1000px, calc(100vw - 32px))"
					onCancel={onFailureClose}
					footer={
						<Button
							color="primary"
							variant="solid"
							onClick={onFailureClose}
						>
							关闭
						</Button>
					}
				>
					<Alert
						type="error"
						showIcon
						title={createFailure.message}
						style={{ marginBottom: 16 }}
					/>
					{createFailure.robotId ? (
						<ContainerLog
							robotId={createFailure.robotId}
							pollingInterval={0}
							height="50vh"
						/>
					) : (
						<Tabs
							items={['客户端', '服务端'].map(label => ({
								key: label,
								label,
								children: <Empty description="未获取到机器人实例信息，无法读取容器日志" />,
							}))}
						/>
					)}
				</Modal>
			)}
		</>
	);
};

export default React.memo(NewRobot);
