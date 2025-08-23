import { ScanOutlined } from '@ant-design/icons';
import { useBoolean, useMemoizedFn, useSetState } from 'ahooks';
import { Button, Modal, Radio, Tooltip } from 'antd';
import React, { useState } from 'react';
import RobotA16Login from './components/RobotA16Login';
import RobotData62Login from './components/RobotData62Login';
import RobotScanLogin from './components/RobotScanLogin';

interface IProps {
	robotId: number;
	onRefresh: () => void;
}

type ILoginType = 'ipad' | 'win' | 'car' | 'mac' | 'iphone' | 'android-pad';

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
						{
							value: 'iphone',
							label: (
								<span>
									iPhone{' '}
									<span style={{ fontSize: 12, color: '#797979' }}>
										(Data62登录，当前机器人曾经通过其他设备成功登录过成功率高)
									</span>
								</span>
							),
						},
						{
							value: 'android-pad',
							label: (
								<span>
									Android平板{' '}
									<span style={{ fontSize: 12, color: '#797979' }}>
										(A16强制登录，需要当前机器人通过其他设备成功登录过)
									</span>
								</span>
							),
						},
					]}
				/>
			</div>
		</Modal>
	);
};

const Login = (props: IProps) => {
	const [onScanOpen, setOnScanOpen] = useBoolean(false);
	const [onData62Open, setOnData62Open] = useBoolean(false);
	const [onA16Open, setOnA16Open] = useBoolean(false);
	const [onTipOpen, setOnTipOpen] = useBoolean(false);
	const [loginType, setLoginType] = useSetState<{ open: boolean; type: ILoginType }>({ open: false, type: 'ipad' });

	const onLoginTypeOK = useMemoizedFn((type: ILoginType) => {
		setLoginType({ open: false, type });
		if (type === 'iphone') {
			setOnData62Open.setTrue();
		} else if (type === 'android-pad') {
			setOnA16Open.setTrue();
		} else {
			setOnScanOpen.setTrue();
		}
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
					<RobotScanLogin
						robotId={props.robotId}
						loginType={loginType.type}
						open={onScanOpen}
						onClose={setOnScanOpen.setFalse}
						onRefresh={props.onRefresh}
					/>
				)}
				{onData62Open && (
					<RobotData62Login
						robotId={props.robotId}
						open={onData62Open}
						onClose={setOnData62Open.setFalse}
						onRefresh={props.onRefresh}
					/>
				)}
				{onA16Open && (
					<RobotA16Login
						robotId={props.robotId}
						open={onA16Open}
						onClose={setOnA16Open.setFalse}
						onRefresh={props.onRefresh}
					/>
				)}
			</div>
		</Tooltip>
	);
};

export default React.memo(Login);
