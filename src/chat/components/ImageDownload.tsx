import { PictureOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React from 'react';
import { useAttachDownload } from '@/hooks';

interface IProps {
	robotId: number;
	messageId: number;
}

const ImageDownload = (props: IProps) => {
	const { loading, onAttachDownload } = useAttachDownload('image', props.robotId, props.messageId);

	return (
		<Button
			type="primary"
			icon={<PictureOutlined />}
			loading={loading}
			ghost
			onClick={onAttachDownload}
		>
			下载图片
		</Button>
	);
};

export default React.memo(ImageDownload);
