import { BellOutlined } from '@ant-design/icons';
import { useBoolean, useMemoizedFn, useRequest } from 'ahooks';
import { Button, Tooltip } from 'antd';
import React from 'react';
import MessageList from './MessageList';

interface IProps {
	robotId: number;
	onRefresh: () => void;
}

const SystemMessage = (props: IProps) => {
	const [open, setOpen] = useBoolean(false);

	const { data, loading, refresh } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1SystemMessagesList({
				id: props.robotId,
			});
			return resp.data?.data;
		},
		{
			manual: false,
			pollingInterval: 60000, // 每60秒请求一次
			pollingWhenHidden: false, // 当页面不可见时不请求
			onError: () => {
				// message.error(reason.message);
			},
		},
	);

	const onRefresh = useMemoizedFn(() => {
		refresh();
		props.onRefresh();
	});

	return (
		<div style={{ display: 'inline-block' }}>
			<Tooltip title="消息通知">
				<Button
					className={data && data.filter(item => !item.is_read).length > 0 ? 'new-message' : undefined}
					type="primary"
					ghost
					disabled={loading || data === undefined}
					icon={<BellOutlined />}
					onClick={() => setOpen.setTrue()}
				/>
			</Tooltip>
			{open && (
				<MessageList
					open={open}
					robotId={props.robotId}
					dataSource={data || []}
					onRefresh={onRefresh}
					onClose={setOpen.setFalse}
				/>
			)}
		</div>
	);
};

export default React.memo(SystemMessage);
