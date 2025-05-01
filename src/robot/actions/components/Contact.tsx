import { useRequest } from 'ahooks';
import { App } from 'antd';
import React from 'react';

interface IProps {
	robotId: number;
}

const Contact = (props: IProps) => {
	const { message } = App.useApp();

	const { data, loading, refresh } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1ContactListList({
				id: props.robotId,
			});
			return resp.data?.data;
		},
		{
			manual: false,
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	return (
		<div>
			{data?.length}
			{loading}
			{refresh.name}
		</div>
	);
};

export default React.memo(Contact);
