import { ScanOutlined } from '@ant-design/icons';
import { useBoolean } from 'ahooks';
import { Button, Tooltip } from 'antd';
import React from 'react';
import RobotLogin from './components/RobotLogin';

interface IProps {
	robotId: number;
	onRefresh: () => void;
}

const Login = (props: IProps) => {
	const [onScanOpen, setOnScanOpen] = useBoolean(false);
	const [onTipOpen, setOnTipOpen] = useBoolean(false);

	return (
		<Tooltip
			title="扫码登录"
			open={onTipOpen}
			onOpenChange={open => {
				if (open) {
					if (!onScanOpen) {
						setOnTipOpen.setTrue();
					}
				} else {
					setOnTipOpen.setFalse();
				}
			}}
		>
			<div style={{ display: 'inline-block' }}>
				<Button
					type="text"
					icon={<ScanOutlined />}
					onClick={() => {
						setOnScanOpen.setTrue();
						setOnTipOpen.setFalse();
					}}
				/>
				{onScanOpen && (
					<RobotLogin
						robotId={props.robotId}
						open={onScanOpen}
						onClose={setOnScanOpen.setFalse}
						onRefresh={props.onRefresh}
					/>
				)}
			</div>
		</Tooltip>
	);
};

export default React.memo(Login);
