import { useRequest } from 'ahooks';
import { App, Button, Spin, Tabs } from 'antd';
import React from 'react';
import Log from '@/components/Log';

interface IProps {
	robotId: number;
}

const ContainerLog = (props: IProps) => {
	const { message } = App.useApp();

	const { data, loading, refresh } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1SystemRobotContainerLogsList({
				id: props.robotId,
			});
			const client = resp.data?.data?.client || [];
			const server = resp.data?.data?.server || [];
			return {
				client: client.join('\n'),
				server: server.join('\n'),
			};
		},
		{
			manual: false,
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	return (
		<Tabs
			type="card"
			tabBarExtraContent={
				<Button
					type="primary"
					ghost
					style={{ marginRight: 3 }}
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
						<Spin spinning={loading}>
							<Log content={data?.client} />
						</Spin>
					),
				},
				{
					key: 'server',
					label: '服务端',
					children: (
						<Spin spinning={loading}>
							<Log content={data?.server} />
						</Spin>
					),
				},
			]}
		/>
	);
};

export default React.memo(ContainerLog);
