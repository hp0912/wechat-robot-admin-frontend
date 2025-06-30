import {
	DownloadOutlined,
	LeftOutlined,
	RightOutlined,
	RotateLeftOutlined,
	RotateRightOutlined,
	SwapOutlined,
	UndoOutlined,
	ZoomInOutlined,
	ZoomOutOutlined,
} from '@ant-design/icons';
import { Image, Space } from 'antd';
import React, { useState } from 'react';
import styled from 'styled-components';

const imageList = [
	'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
	'https://gw.alipayobjects.com/zos/antfincdn/aPkFc8Sj7n/method-draw-image.svg',
];

const ImageGroupContainer = styled.div`
	width: 520px;
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
`;

const MediaList = () => {
	const [current, setCurrent] = useState(0);

	const onDownload = () => {
		const url = imageList[current];
		const suffix = url.slice(url.lastIndexOf('.'));
		const filename = Date.now() + suffix;

		fetch(url)
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
			<ImageGroupContainer>
				{imageList.map(item => (
					<Image
						key={item}
						src={item}
						width={168}
					/>
				))}
			</ImageGroupContainer>
		</Image.PreviewGroup>
	);
};

export default React.memo(MediaList);
