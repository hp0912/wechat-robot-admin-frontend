import { AndroidFilled } from '@ant-design/icons';
import { useBoolean } from 'ahooks';
import { Button, theme, Tooltip } from 'antd';
import React from 'react';
import RobotDetail from './RobotDetail';

interface IProps {
	robotId: number;
	robotStatus: string;
}

const RobotMetadata = (props: IProps) => {
	const { token } = theme.useToken();

	const [onDetailOpen, setOnDetailOpen] = useBoolean(false);
	const [onTipOpen, setOnTipOpen] = useBoolean(false);

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
						setOnDetailOpen.setTrue();
						setOnTipOpen.setFalse();
					}}
				/>
				{onDetailOpen && (
					<RobotDetail
						robotId={props.robotId}
						open={onDetailOpen}
						onClose={setOnDetailOpen.setFalse}
					/>
				)}
			</div>
		</Tooltip>
	);
};

export default React.memo(RobotMetadata);
