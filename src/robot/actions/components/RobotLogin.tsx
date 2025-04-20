import { CheckCircleFilled, CloseCircleFilled, ReloadOutlined } from '@ant-design/icons';
import { useRequest, useSetState } from 'ahooks';
import { App, Button, Modal, QRCode, Space, Spin } from 'antd';
import type { QRCodeProps } from 'antd';
import React from 'react';
import styled from 'styled-components';

interface IProps {
	robotId: number;
	open: boolean;
	onClose: () => void;
	onRefresh: () => void;
}

interface IState {
	uuid: string;
	qrcode: string;
	status?: QRCodeProps['status'];
	avatar?: string;
}

const Container = styled.div`
	p {
		color: rgba(54, 181, 27, 1);
		font-weight: 400;
		font-size: 18px;
		text-align: center;
	}
`;

const RobotLogin = (props: IProps) => {
	const { message } = App.useApp();

	const { open, onClose } = props;

	const [scanState, setScanState] = useSetState<IState>({ uuid: '', qrcode: '等待二维码生成', status: 'loading' });

	const { data: qrData, refreshAsync } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1RobotLoginCreate({
				id: props.robotId,
			});
			return resp.data?.data;
		},
		{
			manual: false,
			onSuccess: resp => {
				if (resp?.uuid && resp.awken) {
					setScanState({
						uuid: resp.uuid,
						qrcode: `http://weixin.qq.com/x/${resp.uuid}`,
						status: 'scanned',
					});
					return;
				}
				if (resp?.uuid) {
					setScanState({
						uuid: resp.uuid,
						qrcode: `http://weixin.qq.com/x/${resp.uuid}`,
						status: undefined,
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

	useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1RobotLoginCheckCreate({
				id: props.robotId,
				uuid: qrData?.uuid || '',
			});
			return resp.data?.data;
		},
		{
			manual: false,
			ready: !!qrData?.uuid,
			refreshDeps: [qrData?.uuid],
			pollingInterval: 3000,
			onSuccess: resp => {
				if (resp?.acctSectResp?.userName) {
					props.onRefresh();
					props.onClose();
					message.success('登陆成功');
					return;
				}
				if (resp?.status === 4 || resp?.expiredTime < 10) {
					setScanState({
						status: 'expired',
					});
					return;
				}
				if (resp?.headImgUrl) {
					setScanState({
						avatar: resp.headImgUrl,
						status: 'scanned',
					});
					return;
				}
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

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
				if (qrData?.awken) {
					return (
						<div>
							<CheckCircleFilled style={{ color: 'green' }} />{' '}
							<span style={{ color: 'green' }}>请在手机上确认登陆</span>
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
			onCancel={onClose}
			width={256}
			maskClosable={false}
			footer={null}
		>
			<Container>
				<p>扫码登陆微信</p>
				<QRCode
					style={{ margin: '0 auto 20px auto' }}
					size={200}
					bordered={false}
					value={scanState.qrcode}
					icon={scanState.avatar}
					status={scanState.status}
					statusRender={customStatusRender}
					onRefresh={refreshAsync}
				/>
			</Container>
		</Modal>
	);
};

export default React.memo(RobotLogin);
