import { Button, Modal } from 'antd';
import React from 'react';

interface IProps {
	open: boolean;
	robotId: number;
	data62: string;
	ticket: string;
	onClose: () => void;
	onSuccess: () => void;
}

const SliderVerify = (props: IProps) => {
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
					onClick={props.onSuccess}
				>
					滑块已经验证通过且已经在手机上点了确认
				</Button>,
			]}
		>
			<div style={{ width: '100%', height: '400px' }}>
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
