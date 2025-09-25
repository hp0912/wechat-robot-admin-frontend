import { ScanOutlined } from '@ant-design/icons';
import { useBoolean, useMemoizedFn, useSetState } from 'ahooks';
import { Button, Checkbox, Modal, Radio, theme, Tooltip } from 'antd';
import React, { useState } from 'react';
import type { Api } from '@/api/wechat-robot/wechat-robot';
import RobotA16Login from './components/RobotA16Login';
import RobotData62Login from './components/RobotData62Login';
import RobotScanLogin from './components/RobotScanLogin';

interface IProps {
	robotId: number;
	robot: IRobot;
	onRefresh: () => void;
}

type IRobot = Api.V1RobotListList.ResponseBody['data']['items'][number];

type ILoginType = 'ipad' | 'win' | 'car' | 'mac' | 'iphone' | 'android';

const LoginType = (props: {
	open: boolean;
	robot: IRobot;
	onOK: (type: ILoginType, isPretender: boolean) => void;
	onClose: () => void;
}) => {
	const { token } = theme.useToken();

	const [loginType, setLoginType] = useState<ILoginType>('ipad');
	const [isPretender, setIsPretender] = useState(false);

	const isDisabledPretender = (type: ILoginType) => {
		return type === 'ipad' || type === 'iphone' || type === 'android';
	};

	const tips = (
		<Tooltip
			title={`${loginType}登录成功后马上下线(手机上下线、机器人界面操作下线都可以)，再重新选择${loginType}登录，同时勾选【伪装成 iPad 登录】`}
		>
			<a style={{ marginLeft: 3, fontSize: 12 }}>如何操作？</a>
		</Tooltip>
	);

	return (
		<Modal
			title="请选择登录方式"
			width={490}
			open={props.open}
			onCancel={props.onClose}
			okText="继续"
			onOk={() => {
				props.onOK(loginType, isPretender);
			}}
		>
			<p style={{ margin: '0 0 16px 0' }}>
				推荐使用<span style={{ color: '#1890ff' }}>iPad登录</span>，iPad登录不上的时候再尝试其他登录方式。
				<span style={{ color: token.colorError }}>温馨提示: 服务器在深圳，广东以外的地区不要轻易尝试。</span>
			</p>
			<div>
				<Radio.Group
					value={loginType}
					onChange={ev => {
						setLoginType(ev.target.value);
						if (isDisabledPretender(ev.target.value)) {
							setIsPretender(false);
						}
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
							disabled: !props.robot.wechat_id,
							label: (
								<span>
									Android手机{' '}
									<span style={{ fontSize: 12, color: '#797979' }}>
										(A16强制登录，需要当前机器人通过其他设备成功登录过)
									</span>
								</span>
							),
						},
					]}
				/>
			</div>
			<div style={{ marginTop: 16 }}>
				<Checkbox
					disabled={isDisabledPretender(loginType) || !props.robot.wechat_id}
					checked={isPretender}
					onChange={ev => {
						setIsPretender(ev.target.checked);
					}}
				>
					伪装成 iPad 登录
				</Checkbox>
				{isDisabledPretender(loginType) ? (
					<span style={{ marginLeft: 3, color: token.colorWarning, fontSize: 12 }}>{`${loginType}登录不支持伪装`}</span>
				) : !props.robot.wechat_id ? (
					<>
						<span
							style={{ marginLeft: 3, color: token.colorWarning, fontSize: 12 }}
						>{`还未通过${loginType}成功登录过，不支持伪装`}</span>
						{tips}
					</>
				) : (
					tips
				)}
			</div>
		</Modal>
	);
};

const Login = (props: IProps) => {
	const [onData62Open, setOnData62Open] = useBoolean(false);
	const [onA16Open, setOnA16Open] = useBoolean(false);
	const [onTipOpen, setOnTipOpen] = useBoolean(false);
	const [onScanOpen, setOnScanOpen] = useSetState({ open: false, isPretender: false });
	const [loginType, setLoginType] = useSetState<{ open: boolean; type: ILoginType }>({ open: false, type: 'ipad' });

	const onLoginTypeOK = useMemoizedFn((type: ILoginType, isPretender: boolean) => {
		setLoginType({ open: false, type });
		if (type === 'iphone') {
			setOnData62Open.setTrue();
		} else if (type === 'android') {
			setOnA16Open.setTrue();
		} else {
			setOnScanOpen({ open: true, isPretender });
		}
	});

	const onLoginTypeClose = useMemoizedFn(() => {
		setLoginType({ open: false, type: 'ipad' });
	});

	const onScanLoginClose = useMemoizedFn(() => {
		setOnScanOpen({ open: false, isPretender: false });
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
						robot={props.robot}
						onOK={onLoginTypeOK}
						onClose={onLoginTypeClose}
					/>
				)}
				{onScanOpen.open && (
					<RobotScanLogin
						robotId={props.robotId}
						loginType={loginType.type}
						isPretender={onScanOpen.isPretender}
						open={onScanOpen.open}
						onClose={onScanLoginClose}
						onRefresh={props.onRefresh}
					/>
				)}
				{onData62Open && (
					<RobotData62Login
						robotId={props.robotId}
						robot={props.robot}
						open={onData62Open}
						onClose={setOnData62Open.setFalse}
						onRefresh={props.onRefresh}
					/>
				)}
				{onA16Open && (
					<RobotA16Login
						robotId={props.robotId}
						robot={props.robot}
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
