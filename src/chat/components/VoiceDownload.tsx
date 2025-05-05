import { Button } from 'antd';
import React from 'react';
import { useAttachDownload } from '@/hooks';
import VoiceOutlined from '@/icons/VoiceOutlined';

interface IProps {
	robotId: number;
	messageId: number;
}

const VoiceDownload = (props: IProps) => {
	const { loading, onAttachDownload } = useAttachDownload('voice', props.robotId, props.messageId);

	return (
		<Button
			type="primary"
			icon={<VoiceOutlined />}
			loading={loading}
			ghost
			onClick={onAttachDownload}
		>
			下载语音
		</Button>
	);
};

export default React.memo(VoiceDownload);
