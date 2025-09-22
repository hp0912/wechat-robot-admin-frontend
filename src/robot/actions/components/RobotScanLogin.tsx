import { CheckCircleFilled, CloseCircleFilled, ReloadOutlined } from '@ant-design/icons';
import { useMemoizedFn, useRequest, useSetState } from 'ahooks';
import { App, Button, Col, Input, Modal, Progress, QRCode, Radio, Row, Space, Spin, theme } from 'antd';
import type { QRCodeProps } from 'antd';
import React from 'react';
import styled from 'styled-components';
import SliderVerify from './SliderVerify';

interface IProps {
	robotId: number;
	loginType: 'ipad' | 'win' | 'car' | 'mac' | 'iphone' | 'android';
	isPretender: boolean;
	open: boolean;
	onClose: () => void;
	onRefresh: () => void;
}

interface IState {
	qrcode: string;
	status?: QRCodeProps['status'];
	avatar?: string;
	percent?: number;
	strokeColor?: string;
}

interface ISecurityVerify {
	type?: 'slider' | '2fa' | undefined;
	secOpen?: boolean;
	tfaOpen?: boolean;
	sliderOpen?: boolean;
	uuid: string;
	code: string;
	ticket: string;
}

const Container = styled.div`
	p {
		color: rgba(54, 181, 27, 1);
		font-weight: 400;
		font-size: 18px;
		text-align: center;
	}
`;

const RobotScanLogin = (props: IProps) => {
	const { message, modal } = App.useApp();
	const { token } = theme.useToken();

	const { open, onClose } = props;

	const [scanState, setScanState] = useSetState<IState>({ qrcode: '等待二维码生成', status: 'loading' });
	const [securityVerifyState, setSecurityVerifyState] = useSetState<ISecurityVerify>({
		uuid: '',
		code: '',
		ticket: '',
	});

	const { data: qrData, refreshAsync } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1RobotLoginCreate(
				{
					login_type: props.loginType,
					is_pretender: props.isPretender,
				},
				{
					id: props.robotId,
				},
			);
			return resp.data?.data;
		},
		{
			manual: false,
			onSuccess: resp => {
				if (resp?.auto_login) {
					props.onRefresh();
					props.onClose();
					message.success('登录成功');
					return;
				}

				setScanState({ percent: 100, strokeColor: token.colorSuccess });

				if (resp?.uuid && resp.awken_login) {
					setScanState({
						qrcode: `http://weixin.qq.com/x/${resp.uuid}`,
						status: 'scanned',
					});
					return;
				}
				if (resp?.uuid) {
					setScanState({
						qrcode: `http://weixin.qq.com/x/${resp.uuid}`,
						status: 'active',
					});
					return;
				}
			},
			onError: reason => {
				setScanState({ status: 'expired' });
				message.error(reason.message);
			},
		},
	);

	const { runAsync, cancel } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1RobotLoginCheckCreate(
				{
					id: props.robotId,
				},
				{
					uuid: qrData?.uuid || '',
				},
			);
			return resp.data?.data;
		},
		{
			manual: false,
			ready: !!qrData?.uuid,
			refreshDeps: [qrData?.uuid],
			pollingInterval: 3000,
			onSuccess: resp => {
				if (resp?.ticket) {
					setSecurityVerifyState({ secOpen: true, type: undefined, uuid: resp.uuid, ticket: resp.ticket, code: '' });
					cancel();
					return;
				}
				if (resp?.acctSectResp?.userName) {
					props.onRefresh();
					props.onClose();
					message.success('登录成功');
					return;
				}
				if (resp?.status === 4 || resp?.expiredTime < 10) {
					setScanState({
						status: 'expired',
						percent: undefined,
					});
					cancel();
					return;
				}
				// 默认240秒超时
				const percent = Math.floor((resp?.expiredTime / 240) * 100);
				let strokeColor = token.colorSuccess;
				if (percent < 50) {
					strokeColor = token.colorWarning;
				}
				if (percent < 20) {
					strokeColor = token.colorError;
				}
				setScanState({ percent, strokeColor });
				if (resp?.headImgUrl) {
					setScanState({
						avatar: resp.headImgUrl,
						status: 'scanned',
					});
					return;
				}
			},
			onError: reason => {
				setScanState({
					status: 'expired',
					percent: undefined,
				});
				cancel();
				message.error(reason.message);
			},
		},
	);

	const { runAsync: run2FA, loading: loading2FA } = useRequest(
		async (code: string) => {
			const resp = await window.wechatRobotClient.api.v1RobotLogin2FaCreate(
				{
					id: props.robotId,
					uuid: securityVerifyState.uuid,
					data62: qrData?.data62 || '',
					code,
					ticket: securityVerifyState.ticket,
				},
				{
					id: props.robotId,
				},
			);
			return resp.data;
		},
		{
			manual: true,
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	const { runAsync: autoSlider, loading: sliderLoading } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1RobotLoginSliderAutoCreate({
				data62: qrData?.data62 || '',
				ticket: securityVerifyState.ticket,
			});
			return resp.data;
		},
		{
			manual: true,
			onSuccess: () => {
				modal.success({
					title: '滑块验证通过',
					content: <>滑块验证已经通过，请在手机上确认。</>,
					okText: '我已经在手机上确认',
					onOk: () => {
						onSliderSuccess();
					},
				});
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	const onSecClose = useMemoizedFn(() => {
		setSecurityVerifyState({ secOpen: false, type: undefined, uuid: '', code: '', ticket: '' });
		props.onClose();
	});

	const on2FAClose = useMemoizedFn(() => {
		setSecurityVerifyState({ tfaOpen: false, type: undefined, uuid: '', code: '', ticket: '' });
		props.onClose();
	});

	const onSliderClose = useMemoizedFn(() => {
		setSecurityVerifyState({ sliderOpen: false, type: undefined, uuid: '', code: '', ticket: '' });
		props.onClose();
	});

	const onSliderSuccess = useMemoizedFn(() => {
		onSliderClose();
		runAsync();
	});

	const customStatusRender: QRCodeProps['statusRender'] = info => {
		switch (info.status) {
			case 'expired':
				return (
					<div>
						<CloseCircleFilled style={{ color: 'red' }} /> {info.locale?.expired}
						<p>
							<Button
								type="link"
								onClick={info.onRefresh}
							>
								<ReloadOutlined /> {info.locale?.refresh}
							</Button>
						</p>
					</div>
				);
			case 'loading':
				return (
					<Space direction="vertical">
						<Spin />
						<p>Loading...</p>
					</Space>
				);
			case 'scanned':
				if (qrData?.awken_login) {
					return (
						<div>
							<CheckCircleFilled style={{ color: 'green' }} />{' '}
							<span style={{ color: 'green' }}>请在手机上确认登录</span>
						</div>
					);
				}
				return (
					<div>
						<CheckCircleFilled style={{ color: 'green' }} /> {info.locale?.scanned}
					</div>
				);
			default:
				return null;
		}
	};

	return (
		<Modal
			title={null}
			open={open}
			onCancel={() => {
				cancel();
				onClose();
			}}
			width={256}
			maskClosable={false}
			footer={null}
		>
			<Container>
				<p>扫码登录微信</p>
				<QRCode
					style={{ margin: '0 auto 8px auto' }}
					size={200}
					bordered={false}
					value={scanState.qrcode}
					icon={scanState.avatar}
					status={scanState.status}
					statusRender={customStatusRender}
					onRefresh={refreshAsync}
				/>
				{!!scanState.percent && (
					<>
						<p style={{ fontSize: 12, textAlign: 'center', color: '#7c7978', marginBottom: 5 }}>登录倒计时</p>
						<Progress
							percent={scanState.percent}
							strokeColor={scanState.strokeColor}
							size="small"
							showInfo={false}
						/>
					</>
				)}
				{!!securityVerifyState.secOpen && (
					<Modal
						title="安全验证"
						open={securityVerifyState.secOpen}
						onCancel={onSecClose}
						width={365}
						maskClosable={false}
						okText="下一步"
						okButtonProps={{ disabled: !securityVerifyState.type, loading: sliderLoading }}
						onOk={async () => {
							if (securityVerifyState.type === '2fa') {
								setSecurityVerifyState({ secOpen: false, tfaOpen: true });
							} else {
								await autoSlider();
							}
						}}
					>
						<p style={{ margin: '0 0 16px 0', fontSize: 13, color: '#3324e0' }}>
							如果手机微信扫码确认登录界面出现6位验证码，则选择安全码验证，否则选择滑块验证。
						</p>
						<Row
							align="middle"
							wrap={false}
						>
							<Col
								flex="0 0 auto"
								style={{ marginRight: 3 }}
							>
								验证方式：
							</Col>
							<Col flex="1 1 auto">
								<Radio.Group
									value={securityVerifyState.type}
									onChange={ev => {
										setSecurityVerifyState({ type: ev.target.value });
									}}
									options={[
										{ value: '2fa', label: '安全码验证' },
										{ value: 'slider', label: '滑块验证' },
									]}
								/>
							</Col>
						</Row>
					</Modal>
				)}
				{!!securityVerifyState.tfaOpen && (
					<Modal
						title="双重认证"
						open={securityVerifyState.tfaOpen}
						onCancel={on2FAClose}
						width={256}
						maskClosable={false}
						footer={null}
					>
						<Spin
							spinning={loading2FA}
							tip="正在验证..."
						>
							<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
								<p style={{ margin: '0 0 16px 0', textAlign: 'center', color: '#3324e0' }}>请输入微信安全码</p>
								<Input.OTP
									value={securityVerifyState.code}
									onChange={async value => {
										setSecurityVerifyState({ code: value });
										if (value?.length && value.length >= 6) {
											await run2FA(value);
											setSecurityVerifyState({ tfaOpen: false });
											setTimeout(() => {
												runAsync();
											}, 1500);
										}
									}}
								/>
							</div>
						</Spin>
					</Modal>
				)}
				{!!securityVerifyState.sliderOpen && (
					<SliderVerify
						open={securityVerifyState.sliderOpen}
						robotId={props.robotId}
						data62={qrData?.data62 || ''}
						ticket={securityVerifyState.ticket}
						onClose={onSliderClose}
						onSuccess={onSliderSuccess}
					/>
				)}
			</Container>
		</Modal>
	);
};

export default React.memo(RobotScanLogin);
