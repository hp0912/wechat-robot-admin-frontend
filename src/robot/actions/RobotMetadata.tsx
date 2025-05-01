import { AndroidFilled } from '@ant-design/icons';
import { useBoolean, useMemoizedFn, useSetState } from 'ahooks';
import { Button, theme, Tooltip } from 'antd';
import React from 'react';
import RobotOfflineDetail from './components/RobotOfflineDetail';
import RobotOnlineDetail from './components/RobotOnlineDetail';

interface IProps {
	robotId: number;
	robotStatus: string;
	onListRefresh: () => void;
	onDetailRefresh: () => void;
}

const RobotMetadata = (props: IProps) => {
	const { token } = theme.useToken();

	const [onDetailOpen, setOnDetailOpen] = useSetState({ offline: false, online: false });
	const [onTipOpen, setOnTipOpen] = useBoolean(false);

	const onClose = useMemoizedFn(() => {
		setOnDetailOpen({ offline: false, online: false });
	});

	return (
		<Tooltip
			title={`机器人元数据${props.robotStatus === 'online' ? '（在线）' : '（离线）'}`}
			open={onTipOpen}
			onOpenChange={open => {
				if (open) {
					setOnTipOpen.setTrue();
				} else {
					setOnTipOpen.setFalse();
				}
			}}
		>
			<div style={{ display: 'inline-block' }}>
				<Button
					type="text"
					icon={<AndroidFilled style={{ color: props.robotStatus === 'online' ? token.colorSuccess : 'gray' }} />}
					onClick={() => {
						if (props.robotStatus === 'online') {
							setOnDetailOpen({ offline: false, online: true });
						} else {
							setOnDetailOpen({ offline: true, online: false });
						}
						setOnTipOpen.setFalse();
					}}
				/>
				{onDetailOpen.offline && (
					<RobotOfflineDetail
						robotId={props.robotId}
						open={onDetailOpen.offline}
						onClose={onClose}
					/>
				)}
				{onDetailOpen.online && (
					<RobotOnlineDetail
						robotId={props.robotId}
						open={onDetailOpen.online}
						onListRefresh={props.onListRefresh}
						onDetailRefresh={props.onDetailRefresh}
						onClose={onClose}
					/>
				)}
			</div>
		</Tooltip>
	);
};

export default React.memo(RobotMetadata);
