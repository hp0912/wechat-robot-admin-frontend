import { useRequest } from 'ahooks';
import { Alert, Button, Spin, Tabs } from 'antd';
import React from 'react';
import Log from '@/components/Log';

interface IProps {
	robotId: number;
	pollingInterval?: number;
	height?: React.CSSProperties['height'];
}

const ContainerLog = (props: IProps) => {
	const { data, error, loading, refresh } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.system.robotContainerLogsList({
				id: props.robotId,
			});
			const client = resp.data?.data?.client || [];
			const server = resp.data?.data?.server || [];

			return {
				client: client.join('\n'),
				server: server.join('\n'),
				clientError: resp.data?.data?.client_error,
				serverError: resp.data?.data?.server_error,
			};
		},
		{
			manual: false,
			pollingInterval: props.pollingInterval ?? 3000,
			refreshDeps: [props.robotId],
		},
	);

	return (
		<Tabs
			type="card"
			tabBarExtraContent={
				<Button
					color="primary"
					variant="filled"
					style={{ marginRight: 3 }}
					loading={loading}
					onClick={refresh}
				>
					刷新日志
				</Button>
			}
			items={[
				{
					key: 'client',
					label: '客户端',
					children: (
						<Spin spinning={loading && !data}>
							{error || data?.clientError ? (
								<Alert
									type="error"
									showIcon
									title={error?.message || data?.clientError}
								/>
							) : (
								<Log
									content={data?.client || (loading ? '' : '暂无客户端容器日志')}
									height={props.height}
								/>
							)}
						</Spin>
					),
				},
				{
					key: 'server',
					label: '服务端',
					children: (
						<Spin spinning={loading && !data}>
							{error || data?.serverError ? (
								<Alert
									type="error"
									showIcon
									title={error?.message || data?.serverError}
								/>
							) : (
								<Log
									content={data?.server || (loading ? '' : '暂无服务端容器日志')}
									height={props.height}
								/>
							)}
						</Spin>
					),
				},
			]}
		/>
	);
};

export default React.memo(ContainerLog);
