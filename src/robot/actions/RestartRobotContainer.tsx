import { BulbFilled, DownOutlined, ExportOutlined, InteractionFilled, PlayCircleFilled } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { App, Button, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import React from 'react';
import type { Api } from '@/api/wechat-robot/wechat-robot';

type IRobot = Api.V1RobotListList.ResponseBody['data']['items'][number];

interface IProps {
	robotId: number;
	robot: IRobot;
	onRefresh: () => void;
}

const RestartRobotContainer = (props: IProps) => {
	const { message, modal } = App.useApp();

	const { runAsync, loading } = useRequest(
		async () => {
			await window.wechatRobotClient.api.v1RobotStateList({
				id: props.robotId,
			});
		},
		{
			manual: true,
			onSuccess: () => {
				message.success('刷新成功');
				props.onRefresh();
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	const { runAsync: exportLoginData, loading: exportLoginDataLoading } = useRequest(
		async () => {
			return await window.wechatRobotClient.api.v1RobotExportLoginDataList({
				id: props.robotId,
			});
		},
		{
			manual: true,
			onSuccess: resp => {
				try {
					const loginData = resp.data?.data;
					if (!loginData) {
						message.error('登录信息已过期');
						return;
					}
					const blob = new Blob([loginData], { type: 'application/json;charset=utf-8' });
					const filename = `${props.robot?.wechat_id || 'logindata'}.json`;
					const url = URL.createObjectURL(blob);
					const a = document.createElement('a');
					a.href = url;
					a.download = filename;
					document.body.appendChild(a);
					a.click();
					document.body.removeChild(a);
					URL.revokeObjectURL(url);
					message.success('导出成功');
				} catch (ex) {
					if (ex instanceof Error) {
						message.error('导出失败: ' + ex.message);
					}
				}
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	const { runAsync: restartClient, loading: restartClientLoading } = useRequest(
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

	const { runAsync: restartServer, loading: restartServerLoading } = useRequest(
		async () => {
			await window.wechatRobotClient.api.v1RobotRestartServerCreate({
				id: props.robotId,
			});
		},
		{
			manual: true,
			onSuccess: () => {
				message.success('重启服务端成功');
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	const items: MenuProps['items'] = [
		{
			label: '导出登录数据',
			key: 'export-login-data',
			icon: <ExportOutlined />,
			onClick: () => {
				if (exportLoginDataLoading) {
					message.warning('正在导出登录数据，请稍后再试');
					return;
				}
				modal.confirm({
					title: '导出机器人登录数据',
					width: 335,
					content: (
						<>
							确定要<span style={{ color: '#1890ff' }}>导出</span>这个机器人的<b>登录数据</b>吗？
						</>
					),
					okText: '导出',
					cancelText: '取消',
					onOk: async () => {
						await exportLoginData();
					},
				});
			},
		},
		{
			label: '导入登录数据',
			key: 'import-login-data',
			icon: <BulbFilled />,
			onClick: () => {
				if (restartClientLoading) {
					message.warning('正在重启客户端容器，请稍后再试');
					return;
				}
				modal.confirm({
					title: '重启机器人客户端',
					width: 335,
					content: (
						<>
							确定要重启这个机器人的<b>客户端容器</b>吗？
						</>
					),
					okText: '重启',
					cancelText: '取消',
					onOk: async () => {
						await restartClient();
						props.onRefresh();
					},
				});
			},
		},
		{
			label: '重启客户端容器',
			key: 'restart-client-container',
			icon: <BulbFilled />,
			onClick: () => {
				if (restartClientLoading) {
					message.warning('正在重启客户端容器，请稍后再试');
					return;
				}
				modal.confirm({
					title: '重启机器人客户端',
					width: 335,
					content: (
						<>
							确定要重启这个机器人的<b>客户端容器</b>吗？
						</>
					),
					okText: '重启',
					cancelText: '取消',
					onOk: async () => {
						await restartClient();
						props.onRefresh();
					},
				});
			},
		},
		{
			label: '重启服务端容器',
			key: 'restart-server-container',
			icon: <PlayCircleFilled />,
			onClick: () => {
				if (restartServerLoading) {
					message.warning('正在重启服务端容器，请稍后再试');
					return;
				}
				modal.confirm({
					title: '重启机器人服务端容器',
					width: 335,
					content: (
						<>
							确定要重启这个机器人的<b>服务端容器</b>吗？
						</>
					),
					okText: '重启',
					cancelText: '取消',
					onOk: async () => {
						await restartServer();
						props.onRefresh();
					},
				});
			},
		},
	];

	return (
		<Dropdown.Button
			type="primary"
			menu={{ items }}
			buttonsRender={() => {
				return [
					<Button
						key="left"
						type="primary"
						loading={loading}
						icon={<InteractionFilled />}
						onClick={runAsync}
					>
						刷新状态
					</Button>,
					<Button
						key="right"
						type="primary"
						icon={<DownOutlined />}
					/>,
				];
			}}
		/>
	);
};

export default React.memo(RestartRobotContainer);
