import { Button, Modal } from 'antd';
import React, { useEffect, useRef } from 'react';

interface IProps {
	open: boolean;
	html: string;
	onClose: () => void;
	onSuccess: (value: string) => void;
}

const SliderVerify = (props: IProps) => {
	const container = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const iframe = document.createElement('iframe');
		iframe.style.width = '100%';
		iframe.style.height = '300px';
		iframe.style.border = 'none';
		iframe.style.margin = '0 auto';

		iframe.onload = () => {
			const doc = iframe.contentDocument;
			if (!doc) {
				return;
			}
			doc.body.innerHTML = '';
			doc.body.innerHTML = props.html || '获取滑块失败';
		};

		if (container.current) {
			container.current.appendChild(iframe);
		}
	}, []);

	return (
		<Modal
			title="滑块验证"
			open={props.open}
			onCancel={props.onClose}
			width={680}
			maskClosable={false}
			footer={[
				<Button
					key="ok"
					type="primary"
				>
					滑块已经验证通过且已经在手机上点了确认
				</Button>,
			]}
		>
			<div ref={container} />
		</Modal>
	);
};

export default React.memo(SliderVerify);
