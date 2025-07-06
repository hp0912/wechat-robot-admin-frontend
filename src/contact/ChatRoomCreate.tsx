import { UsergroupAddOutlined } from '@ant-design/icons';
import { useBoolean } from 'ahooks';
import { Button, Tooltip } from 'antd';
import React from 'react';
import type { Api } from '@/api/wechat-robot/wechat-robot';
import ChatRoomCreateConfirm from './ChatRoomCreateConfirm';

interface IProps {
	robotId: number;
	robot: Api.V1RobotViewList.ResponseBody['data'];
	onRefresh: () => void;
}

const ChatRoomCreate = (props: IProps) => {
	const [open, setOpen] = useBoolean(false);

	return (
		<div style={{ display: 'inline-block' }}>
			<Tooltip title="发起群聊">
				<Button
					type="primary"
					ghost
					icon={<UsergroupAddOutlined />}
					onClick={setOpen.setTrue}
				/>
			</Tooltip>
			{open && (
				<ChatRoomCreateConfirm
					open={open}
					robotId={props.robotId}
					robot={props.robot}
					onRefresh={props.onRefresh}
					onClose={setOpen.setFalse}
				/>
			)}
		</div>
	);
};

export default React.memo(ChatRoomCreate);
