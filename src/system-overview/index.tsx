import { useRequest } from 'ahooks';
import { App, Card, Flex, Progress, theme } from 'antd';
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
	const { token } = theme.useToken();
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

	const { data: overview } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1SystemRobotContainerStatsList({
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

	const getStrokeColor = (percent: string) => {
		const value = Number(percent.replace('%', ''));
		if (value < 50) {
			return token.colorSuccess;
		} else if (value < 80) {
			return token.colorWarning;
		} else {
			return token.colorError;
		}
	};

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
					<LoadingOutlined spin />
				) : data.last_login_at && data.status === 'online' ? (
					<div>
						<Duration timestamp={data.last_login_at} />
						<p style={{ fontSize: 12, color: 'gray' }}>
							登录时间: {dayjs(data.last_login_at * 1000).format('YYYY-MM-DD HH:mm:ss')}
						</p>
					</div>
				) : (
					<h3>未知</h3>
				)}
			</Card>
			<Card
				title="内存占用"
				style={{ width: '24%' }}
			>
				{!overview ? (
					<LoadingOutlined spin />
				) : (
					<div>
						<p style={{ fontSize: 12 }}>
							<b>客户端: </b>
							{overview.client.memory_usage.usage} / {overview.client.memory_usage.limit}
						</p>
						<Progress
							percent={Number(overview.client.memory_usage.percent.replace('%', ''))}
							strokeColor={getStrokeColor(overview.client.memory_usage.percent)}
							size="small"
							showInfo={false}
						/>
						<p style={{ fontSize: 12 }}>
							<b>服务端: </b>
							{overview.server.memory_usage.usage} / {overview.server.memory_usage.limit}
						</p>
						<Progress
							percent={Number(overview.server.memory_usage.percent.replace('%', ''))}
							strokeColor={getStrokeColor(overview.server.memory_usage.percent)}
							size="small"
							showInfo={false}
						/>
					</div>
				)}
			</Card>
			<Card
				title="CPU 使用率"
				style={{ width: '24%' }}
			>
				{!overview ? (
					<LoadingOutlined spin />
				) : (
					<div>
						<p style={{ fontSize: 12 }}>
							<b>客户端: </b>
							{overview.client.cpu_usage}
						</p>
						<Progress
							percent={Number(overview.client.cpu_usage.replace('%', ''))}
							strokeColor={getStrokeColor(overview.client.cpu_usage)}
							size="small"
							showInfo={false}
						/>
						<p style={{ fontSize: 12 }}>
							<b>服务端: </b>
							{overview.server.cpu_usage}
						</p>
						<Progress
							percent={Number(overview.server.cpu_usage.replace('%', ''))}
							strokeColor={getStrokeColor(overview.server.cpu_usage)}
							size="small"
							showInfo={false}
						/>
					</div>
				)}
			</Card>
			<Card
				title="磁盘使用"
				style={{ width: '24%' }}
			>
				{!overview ? (
					<LoadingOutlined spin />
				) : (
					<div>
						<p style={{ fontSize: 12 }}>
							<b>客户端读取: </b>
							{overview.client.disk_read}
						</p>
						<p style={{ fontSize: 12 }}>
							<b>客户端写入: </b>
							{overview.client.disk_write}
						</p>
						<p style={{ fontSize: 12 }}>
							<b>服务端读取: </b>
							{overview.server.disk_read}
						</p>
						<p style={{ fontSize: 12 }}>
							<b>服务端写入: </b>
							{overview.server.disk_write}
						</p>
					</div>
				)}
			</Card>
		</Flex>
	);
};

export default React.memo(SystemOverview);
