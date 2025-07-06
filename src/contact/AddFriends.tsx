import { useBoolean } from 'ahooks';
import { Button, Tooltip } from 'antd';
import React from 'react';
import type { Api } from '@/api/wechat-robot/wechat-robot';
import AddFriendsOutlined from '@/icons/AddFriendsOutlined';
import SearchFriends from './SearchFriends';

interface IProps {
	robotId: number;
	robot: Api.V1RobotViewList.ResponseBody['data'];
	onRefresh: () => void;
}

const AddFriends = (props: IProps) => {
	const [open, setOpen] = useBoolean(false);

	return (
		<div style={{ display: 'inline-block' }}>
			<Tooltip title="添加好友">
				<Button
					type="primary"
					ghost
					icon={<AddFriendsOutlined />}
					onClick={setOpen.setTrue}
				/>
			</Tooltip>
			{open && (
				<SearchFriends
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

export default React.memo(AddFriends);
