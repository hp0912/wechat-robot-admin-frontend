import { Drawer } from 'antd';
import React, { useContext } from 'react';
import { GlobalContext } from '@/context/global';

interface IProps {
	open?: boolean;
	contactId?: string;
	contactName?: string;
	onClose: () => void;
}

const SpecifiContactMomentList = (props: IProps) => {
	const globalContext = useContext(GlobalContext);

	return (
		<Drawer
			title={`${props.contactName}的朋友圈`}
			width={globalContext.global?.isSmallScreen ? '100%' : '80%'}
			open={props.open}
			onClose={props.onClose}
			footer={null}
		></Drawer>
	);
};

export default React.memo(SpecifiContactMomentList);
