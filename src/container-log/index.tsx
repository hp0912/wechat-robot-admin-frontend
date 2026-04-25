import { useRequest } from 'ahooks';
import { App, Button, Spin, Tabs } from 'antd';
import React, { useRef } from 'react';
import Log from '@/components/Log';

interface IProps {
	robotId: number;
}

const ContainerLog = (props: IProps) => {
	const { message } = App.useApp();

	const isFirstRender = useRef(true);

	const { data, loading, refresh } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1SystemRobotContainerLogsList({
				id: props.robotId,
			});
			const client = resp.data?.data?.client || [];
			const server = resp.data?.data?.server || [];

			isFirstRender.current = false;

			return {
				client: client.join('\n'),
				server: server.join('\n'),
			};
		},
		{
			manual: false,
			pollingInterval: 3000,
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
					color="primary"
					variant="filled"
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
						<Spin spinning={loading && isFirstRender.current}>
							<Log content={data?.client} />
						</Spin>
					),
				},
				{
					key: 'server',
					label: '服务端',
					children: (
						<Spin spinning={loading && isFirstRender.current}>
							<Log content={data?.server} />
						</Spin>
					),
				},
			]}
		/>
	);
};

export default React.memo(ContainerLog);
