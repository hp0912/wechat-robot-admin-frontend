import { AndroidFilled } from '@ant-design/icons';
import { useBoolean, useMemoizedFn } from 'ahooks';
import { Button, theme, Tooltip } from 'antd';
import React, { Suspense } from 'react';
import LoadingOutlined from '@/icons/LoadingOutlined';

interface IProps {
	robotId: number;
	robotStatus: string;
	onListRefresh: () => void;
	onDetailRefresh: () => void;
}

const RobotDetail = React.lazy(() => import(/* webpackChunkName: "robot-detail" */ './components/RobotDetail'));

const RobotMetadata = (props: IProps) => {
	const { token } = theme.useToken();

	const [onDetailOpen, setOnDetailOpen] = useBoolean(false);
	const [onLazyLoading, setLazyLoading] = useBoolean(false);

	const onRobotDetailLoaded = useMemoizedFn(() => {
		setLazyLoading.setFalse();
	});

	const onClose = useMemoizedFn(() => {
		setOnDetailOpen.setFalse();
	});

	return (
		<Tooltip title={`机器人元数据${props.robotStatus === 'online' ? '（在线）' : '（离线）'}`}>
			<div style={{ display: 'inline-block' }}>
				<Button
					type="text"
					icon={
						onLazyLoading ? (
							<LoadingOutlined spin />
						) : (
							<AndroidFilled style={{ color: props.robotStatus === 'online' ? token.colorSuccess : 'gray' }} />
						)
					}
					onClick={() => {
						setOnDetailOpen.setTrue();
						setLazyLoading.setTrue();
					}}
				/>
				{onDetailOpen && (
					<Suspense fallback={null}>
						<RobotDetail
							robotId={props.robotId}
							open={onDetailOpen}
							onListRefresh={props.onListRefresh}
							onDetailRefresh={props.onDetailRefresh}
							onClose={onClose}
							onModuleLoaded={onRobotDetailLoaded}
						/>
					</Suspense>
				)}
			</div>
		</Tooltip>
	);
};

export default React.memo(RobotMetadata);
