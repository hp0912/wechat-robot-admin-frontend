import {
	DownloadOutlined,
	EyeOutlined,
	RotateLeftOutlined,
	RotateRightOutlined,
	SwapOutlined,
	UndoOutlined,
	ZoomInOutlined,
	ZoomOutOutlined,
} from '@ant-design/icons';
import { Image, Space } from 'antd';
import React from 'react';
import type * as Api from '@/api/wechat-robot/wechat-robot';
import { ImageFallback } from '@/constant';
import { useAttachDownload } from '@/hooks';

interface IProps {
	robotId: number;
	message: NonNullable<NonNullable<Api.Chat.HistoryList.ResponseBody['data']>['items']>[number];
}

const ImageMessage = (props: IProps) => {
	const { onAttachDownload: onDownload } = useAttachDownload('image', props.robotId, props.message.id!);

	const url =
		props.message.attachment_url || `/api/v1/chat/image/download?id=${props.robotId}&message_id=${props.message.id}`;

	return (
		<Image
			styles={{
				image: {
					maxHeight: 300,
					width: 'auto',
					maxWidth: '100%',
				},
			}}
			src={url}
			alt={props.message.display_full_content || '图片消息'}
			preview={{
				mask: true,
				cover: (
					<span style={{ color: '#fff' }}>
						<EyeOutlined style={{ marginRight: 8 }} />
						<span>点击查看大图</span>
					</span>
				),
				actionsRender: (
					_,
					{
						transform: { scale },
						actions: { onFlipY, onFlipX, onRotateLeft, onRotateRight, onZoomOut, onZoomIn, onReset },
					},
				) => (
					<Space
						size={12}
						className="toolbar-wrapper"
					>
						<DownloadOutlined onClick={onDownload} />
						<SwapOutlined
							rotate={90}
							onClick={onFlipY}
						/>
						<SwapOutlined onClick={onFlipX} />
						<RotateLeftOutlined onClick={onRotateLeft} />
						<RotateRightOutlined onClick={onRotateRight} />
						<ZoomOutOutlined
							disabled={scale === 1}
							onClick={onZoomOut}
						/>
						<ZoomInOutlined
							disabled={scale === 50}
							onClick={onZoomIn}
						/>
						<UndoOutlined onClick={onReset} />
					</Space>
				),
			}}
			fallback={ImageFallback}
		/>
	);
};

export default React.memo(ImageMessage);
