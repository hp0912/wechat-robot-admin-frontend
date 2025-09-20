import { Button, message, Modal } from 'antd';
import React, { useEffect, useState } from 'react';

interface IProps {
	open: boolean;
	robotId: number;
	data62: string;
	ticket: string;
	onClose: () => void;
	onSuccess: () => void;
}

const SliderVerify = (props: IProps) => {
	const [isSliderVerified, setIsSliderVerified] = useState(false);

	useEffect(() => {
		const onComplete = (event: MessageEvent) => {
			if (event.data.type === 'sliderResult') {
				const result = event.data.data as { success: boolean; message: string };
				if (result.success) {
					setIsSliderVerified(true);
					message.success('滑块验证成功，请在手机上点击确认登录');
				} else {
					message.error(`滑块验证失败: ${result.message}`);
				}
			}
		};
		window.addEventListener('message', onComplete);
		return () => {
			window.removeEventListener('message', onComplete);
		};
	}, []);

	return (
		<Modal
			title={
				<>
					滑块验证{' '}
					<span style={{ color: 'red', fontSize: 12 }}>滑块验证通过之后请在手机上点击确认，再点击右下角的确认按钮</span>
				</>
			}
			open={props.open}
			onCancel={props.onClose}
			width={500}
			maskClosable={false}
			footer={[
				<Button
					key="ok"
					type="primary"
					disabled={!isSliderVerified}
					onClick={props.onSuccess}
				>
					滑块已经验证通过且已经在手机上点了确认
				</Button>,
			]}
		>
			<div style={{ width: '100%', height: '310px', margin: '0 auto', border: '1px solid #f0f0f0', borderRadius: 8 }}>
				<iframe
					src={`/api/v1/robot/login/slider?id=${props.robotId}&data62=${props.data62}&ticket=${props.ticket}`}
					style={{
						width: '100%',
						height: '100%',
						border: 'none',
						borderRadius: '4px',
					}}
					title="滑块验证"
				/>
			</div>
		</Modal>
	);
};

export default React.memo(SliderVerify);
