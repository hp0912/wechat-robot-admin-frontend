import { useRequest } from 'ahooks';
import { App, Button, Tooltip } from 'antd';
import axios from 'axios';
import React from 'react';
import type { Api } from '@/api/wechat-robot/wechat-robot';
import PhoneOutlined from '@/icons/PhoneOutlined';

interface IProps {
	robotId: number;
	robot: Api.V1RobotViewList.ResponseBody['data'];
}

const OAuth = (props: IProps) => {
	const { message } = App.useApp();

	const { runAsync, loading } = useRequest(
		async () => {
			const formData = new FormData();
			formData.append('qrcode', '');
			await axios.post(`/api/v1/wxapp/qrcode-auth-login?id=${props.robotId}`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});
		},
		{
			manual: true,
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	return (
		<div style={{ display: 'inline-block' }}>
			<Tooltip title="授权APP登录，点击会读取剪切板中的二维码图片，进行授权登录">
				<Button
					type="primary"
					ghost
					icon={<PhoneOutlined />}
					loading={loading}
					onClick={runAsync}
				/>
			</Tooltip>
		</div>
	);
};

export default React.memo(OAuth);
