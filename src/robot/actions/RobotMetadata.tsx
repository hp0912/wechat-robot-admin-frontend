import { AndroidFilled } from '@ant-design/icons';
import { useBoolean, useMemoizedFn } from 'ahooks';
import { Button, theme } from 'antd';
import React, { Suspense } from 'react';
import type { Api } from '@/api/wechat-robot/wechat-robot';
import AndroidPadFilled from '@/icons/AndroidPadFilled';
import CarWeChatFilled from '@/icons/CarWeChatFilled';
import IPadFilled from '@/icons/IPadFilled';
import IPhoneXFilled from '@/icons/IPhoneXFilled';
import LoadingOutlined from '@/icons/LoadingOutlined';
import MacFilled from '@/icons/MacFilled';
import WindowsFilled from '@/icons/WindowsFilled';

interface IProps {
	robotId: number;
	robot: Api.V1RobotListList.ResponseBody['data']['items'][number];
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

	const getDeviceIcon = () => {
		const color = props.robot?.status === 'online' ? token.colorSuccess : 'gray';
		switch (props.robot?.device_type) {
			case 'iPad':
				return <IPadFilled style={{ color }} />;
			case 'iPhone':
				return <IPhoneXFilled style={{ color }} />;
			case 'Mac':
				return <MacFilled style={{ color }} />;
			case 'Android':
				return <AndroidFilled style={{ color }} />;
			case 'Pad-Android':
				return <AndroidPadFilled style={{ color }} />;
			case 'Windows':
				return <WindowsFilled style={{ color }} />;
			case 'Car':
				return <CarWeChatFilled style={{ color }} />;
			default:
				return <AndroidFilled style={{ color }} />;
		}
	};

	return (
		<div style={{ display: 'inline-block', width: 32, height: 32, overflow: 'hidden' }}>
			<Button
				type="text"
				icon={onLazyLoading ? <LoadingOutlined spin /> : getDeviceIcon()}
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
	);
};

export default React.memo(RobotMetadata);
