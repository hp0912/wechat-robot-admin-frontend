import { ScanOutlined } from '@ant-design/icons';
import { useBoolean, useMemoizedFn, useSetState } from 'ahooks';
import { Button, Modal, Radio, Tooltip } from 'antd';
import React, { useState } from 'react';
import RobotLogin from './components/RobotLogin';

interface IProps {
	robotId: number;
	onRefresh: () => void;
}

type ILoginType = 'ipad' | 'win' | 'car' | 'mac';

const LoginType = (props: { open: boolean; onOK: (type: ILoginType) => void; onClose: () => void }) => {
	const [loginType, setLoginType] = useState<ILoginType>('ipad');

	return (
		<Modal
			title="请选择登录方式"
			width={490}
			open={props.open}
			onCancel={props.onClose}
			okText="继续"
			onOk={() => {
				props.onOK(loginType);
			}}
		>
			<p style={{ margin: '0 0 16px 0' }}>
				推荐使用<span style={{ color: '#1890ff' }}>iPad登录</span>，iPad登录不上的时候再尝试其他登录方式。
			</p>
			<div>
				<Radio.Group
					value={loginType}
					onChange={ev => {
						setLoginType(ev.target.value);
					}}
					options={[
						{ value: 'ipad', label: 'iPad' },
						{ value: 'win', label: 'Windows微信' },
						{ value: 'mac', label: 'Mac微信' },
						{ value: 'car', label: '车载微信' },
					]}
				/>
			</div>
		</Modal>
	);
};

const Login = (props: IProps) => {
	const [onScanOpen, setOnScanOpen] = useBoolean(false);
	const [onTipOpen, setOnTipOpen] = useBoolean(false);
	const [loginType, setLoginType] = useSetState<{ open: boolean; type: ILoginType }>({ open: false, type: 'ipad' });

	const onLoginTypeOK = useMemoizedFn((type: ILoginType) => {
		setLoginType({ open: false, type });
		setOnScanOpen.setTrue();
	});

	const onLoginTypeClose = useMemoizedFn(() => {
		setLoginType({ open: false, type: 'ipad' });
	});

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
						setLoginType({ open: true });
						setOnTipOpen.setFalse();
					}}
				/>
				{loginType.open && (
					<LoginType
						open={loginType.open}
						onOK={onLoginTypeOK}
						onClose={onLoginTypeClose}
					/>
				)}
				{onScanOpen && (
					<RobotLogin
						robotId={props.robotId}
						loginType={loginType.type}
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
