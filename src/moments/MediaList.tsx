import {
	DownloadOutlined,
	EyeOutlined,
	LeftOutlined,
	PlayCircleFilled,
	RightOutlined,
	RotateLeftOutlined,
	RotateRightOutlined,
	SwapOutlined,
	UndoOutlined,
	ZoomInOutlined,
	ZoomOutOutlined,
} from '@ant-design/icons';
import { App, Image, Space } from 'antd';
import React, { useState } from 'react';
import styled from 'styled-components';
import type { Media } from '@/api/wechat-robot/wechat-robot';
import { ImageFallback } from '@/constant';

interface IProps {
	className?: string;
	style?: React.CSSProperties;
	dataSource: Media[];
}

const ImageGroupContainer = styled.div`
	width: 520px;
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
`;

const MediaList = (props: IProps) => {
	const { message } = App.useApp();

	const [current, setCurrent] = useState(0);

	const onDownload = () => {
		let url = props.dataSource[current].URL?.Value;
		if (props.dataSource[current].HD?.Value) {
			url = props.dataSource[current].HD.Value;
		} else if (props.dataSource[current].UHD?.Value) {
			url = props.dataSource[current].UHD.Value;
		}
		url = url?.replace('http://', 'https://');
		const suffix = url!.slice(url!.lastIndexOf('.'));
		const filename = Date.now() + suffix;

		if (url) {
			message.warning('暂不支持图片下载，请右击图片另存为');
			return;
		}

		fetch(url!)
			.then(response => response.blob())
			.then(blob => {
				const blobUrl = URL.createObjectURL(new Blob([blob]));
				const link = document.createElement('a');
				link.href = blobUrl;
				link.download = filename;
				document.body.appendChild(link);
				link.click();
				URL.revokeObjectURL(blobUrl);
				link.remove();
			});
	};

	return (
		<Image.PreviewGroup
			preview={{
				toolbarRender: (
					_,
					{
						transform: { scale },
						actions: { onActive, onFlipY, onFlipX, onRotateLeft, onRotateRight, onZoomOut, onZoomIn, onReset },
					},
				) => (
					<Space
						size={12}
						className="toolbar-wrapper"
					>
						<LeftOutlined onClick={() => onActive?.(-1)} />
						<RightOutlined onClick={() => onActive?.(1)} />
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
				onChange: index => {
					setCurrent(index);
				},
			}}
		>
			<ImageGroupContainer
				style={props.style}
				className={props.className}
			>
				{props.dataSource.map(item => {
					const width = props.dataSource.length === 1 ? undefined : 168;
					const height = props.dataSource.length === 1 ? undefined : 168;
					const src = item.HD?.Value || item.UHD?.Value || item.URL?.Value || item.Thumb?.Value;

					return (
						<Image
							key={item.IDStr}
							src={item.Thumb?.Value?.replace('http://', 'https://')}
							referrerPolicy="no-referrer"
							width={width}
							height={height}
							fallback={ImageFallback}
							preview={{
								destroyOnClose: true,
								mask: (
									<span style={{ color: '#fff' }}>
										<EyeOutlined style={{ marginRight: 8 }} />
										<span>查看高清大图</span>
									</span>
								),
								src: src?.replace('http://', 'https://'),
							}}
						/>
					);
				})}
			</ImageGroupContainer>
		</Image.PreviewGroup>
	);
};

export default React.memo(MediaList);

interface IMediaVideoProps {
	className?: string;
	style?: React.CSSProperties;
	dataSource: Media;
	videoDownloadUrl: string;
}

export const MediaVideo = (props: IMediaVideoProps) => {
	const src = props.dataSource.Thumb?.Value?.replace('http://', 'https://');
	return (
		<Image
			preview={{
				destroyOnClose: true,
				mask: (
					<span style={{ color: '#fff' }}>
						<PlayCircleFilled style={{ marginRight: 8 }} />
						<span>播放</span>
					</span>
				),
				imageRender: () => (
					<video
						muted
						width="600px"
						controls
						src={props.videoDownloadUrl}
					/>
				),
				toolbarRender: () => null,
			}}
			src={src}
			fallback={ImageFallback}
		/>
	);
};
