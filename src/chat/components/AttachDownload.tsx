import { FileOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React from 'react';
import { useAttachDownload } from '@/hooks';

interface IProps {
	robotId: number;
	messageId: number;
}

const AttachDownload = (props: IProps) => {
	const { loading, onAttachDownload } = useAttachDownload('file', props.robotId, props.messageId);

	return (
		<Button
			type="primary"
			icon={<FileOutlined />}
			loading={loading}
			ghost
			onClick={onAttachDownload}
		>
			下载附件
		</Button>
	);
};

export default React.memo(AttachDownload);
