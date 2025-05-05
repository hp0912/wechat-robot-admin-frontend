import { PictureOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { App, Button } from 'antd';
import axios from 'axios';
import React from 'react';
import { onAttachDownload } from '@/utils';

interface IProps {
	robotId: number;
	messageId: number;
}

const ImageDownload = (props: IProps) => {
	const { message } = App.useApp();

	const { runAsync, loading } = useRequest(
		async () => {
			// 发送请求，指定返回类型为blob
			const resp = await axios({
				method: 'GET',
				url: '/api/v1/chat/image/download',
				params: {
					id: props.robotId,
					message_id: props.messageId,
				},
				responseType: 'blob', // 重要：指定响应类型为blob
			});
			onAttachDownload(resp, props.messageId);
		},
		{
			manual: true,
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	return (
		<Button
			type="primary"
			icon={<PictureOutlined />}
			loading={loading}
			ghost
			onClick={runAsync}
		>
			下载图片
		</Button>
	);
};

export default React.memo(ImageDownload);
