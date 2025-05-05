import { VideoCameraOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React from 'react';
import { useAttachDownload } from '@/hooks';

interface IProps {
	robotId: number;
	messageId: number;
}

const VideoDownload = (props: IProps) => {
	const { loading, onAttachDownload } = useAttachDownload('video', props.robotId, props.messageId);

	return (
		<Button
			type="primary"
			icon={<VideoCameraOutlined />}
			loading={loading}
			ghost
			onClick={onAttachDownload}
		>
			下载视频
		</Button>
	);
};

export default React.memo(VideoDownload);
