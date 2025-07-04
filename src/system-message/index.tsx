import { BellOutlined } from '@ant-design/icons';
import { useBoolean, useRequest } from 'ahooks';
import { App, Button } from 'antd';
import React from 'react';
import MessageList from './MessageList';

interface IProps {
	robotId: number;
}

const SystemMessage = (props: IProps) => {
	const { message } = App.useApp();

	const [open, setOpen] = useBoolean(false);

	const { data, loading } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1SystemMessagesList({
				id: props.robotId,
			});
			return resp.data?.data;
		},
		{
			manual: false,
			pollingInterval: 10000, // 每10秒请求一次
			pollingWhenHidden: false, // 当页面不可见时不请求
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	return (
		<div style={{ display: 'inline-block' }}>
			<Button
				className={data && data.length > 0 ? 'new-message' : undefined}
				type="primary"
				ghost
				disabled={loading || data === undefined}
				icon={<BellOutlined />}
				onClick={() => setOpen.setTrue()}
			/>
			{open && (
				<MessageList
					open={open}
					dataSource={data || []}
					onClose={setOpen.setFalse}
				/>
			)}
		</div>
	);
};

export default React.memo(SystemMessage);
