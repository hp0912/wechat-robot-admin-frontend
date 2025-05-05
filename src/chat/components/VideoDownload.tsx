import { VideoCameraOutlined } from '@ant-design/icons';
import { useBoolean, useMemoizedFn } from 'ahooks';
import { App, Button } from 'antd';
import React from 'react';
import streamSaver from 'streamsaver';

interface IProps {
	robotId: number;
	messageId: number;
}

const VideoDownload = (props: IProps) => {
	const { message } = App.useApp();

	const [loading, setLoading] = useBoolean(false);

	const downloadFile = useMemoizedFn(async () => {
		try {
			setLoading.setTrue();

			const url = `/api/v1/chat/video/download?id=${props.robotId}&message_id=${props.messageId}`;
			const resp = await fetch(url);
			if (!resp.ok) {
				resp.json().then(data => {
					if ('message' in data && typeof data.message === 'string') {
						message.error(data.message);
					}
				});
				return;
			}

			const disposition = resp.headers.get('Content-Disposition') || '';
			const fileName = /filename="?([^";]+)"?/.exec(disposition)?.[1] || 'file.bin';

			const fileStream = streamSaver.createWriteStream(fileName);
			const writer = fileStream.getWriter();

			if (resp.body) {
				const reader = resp.body.getReader();
				while (true) {
					const { done, value } = await reader.read();
					if (done) break;
					await writer.write(value);
				}
				writer.close();
			}
		} finally {
			setLoading.setFalse();
		}
	});

	return (
		<Button
			type="primary"
			icon={<VideoCameraOutlined />}
			loading={loading}
			ghost
			onClick={downloadFile}
		>
			下载视频
		</Button>
	);
};

export default React.memo(VideoDownload);
