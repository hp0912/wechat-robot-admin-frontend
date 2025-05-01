import { useRequest } from 'ahooks';
import { App, Card, Flex } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import LoadingOutlined from '@/icons/LoadingOutlined';
import { formatDuration } from '@/utils';

interface IProps {
	robotId: number;
}

const Duration = (props: { timestamp: number }) => {
	const [now, setNow] = useState(Date.now() / 1000);
	useEffect(() => {
		const interval = setInterval(() => {
			setNow(Date.now() / 1000);
		}, 1000);

		return () => clearInterval(interval);
	}, []);
	return <h3>{formatDuration(now - props.timestamp)}</h3>;
};

const SystemOverview = (props: IProps) => {
	const { message } = App.useApp();

	const { data } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1RobotViewList({
				id: props.robotId,
			});
			return resp.data?.data;
		},
		{
			manual: false,
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	return (
		<Flex
			justify="space-between"
			gap={8}
			style={{ paddingRight: 22 }}
		>
			<Card
				title="运行时间"
				style={{ width: '24%' }}
			>
				{!data ? (
					<LoadingOutlined />
				) : (
					<div>
						<Duration timestamp={data.last_login_at} />
						<p style={{ fontSize: 12, color: 'gray' }}>
							登录时间: {dayjs(data.last_login_at * 1000).format('YYYY-MM-DD HH:mm:ss')}
						</p>
					</div>
				)}
			</Card>
			<Card
				title="内存占用"
				style={{ width: '24%' }}
			>
				{!data ? <LoadingOutlined /> : <div></div>}
			</Card>
			<Card
				title="CPU 使用率"
				style={{ width: '24%' }}
			>
				{!data ? <LoadingOutlined /> : <div></div>}
			</Card>
			<Card
				title="磁盘使用"
				style={{ width: '24%' }}
			>
				{!data ? <LoadingOutlined /> : <div></div>}
			</Card>
		</Flex>
	);
};

export default React.memo(SystemOverview);
