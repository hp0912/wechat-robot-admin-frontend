import { SmileOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { App, Avatar, Button, theme } from 'antd';
import React from 'react';
import type { Api } from '@/api/wechat-robot/wechat-robot';
import { DefaultAvatar } from '@/constant';

type IDataSource = Api.V1SystemMessagesList.ResponseBody['data'][number];

interface IProps {
	robotId: number;
	dataSource: IDataSource;
	onRefresh: () => void;
}

const ChatRoomJoin = (props: IProps) => {
	const { token } = theme.useToken();
	const { message, modal } = App.useApp();

	const { runAsync } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1ChatRoomJoinCreate(
				{
					id: props.robotId,
					system_message_id: props.dataSource.id,
				},
				{ id: props.robotId },
			);
			await new Promise(resolve => setTimeout(resolve, 6000)); // 等待6秒，确保数据更新
			return resp.data;
		},
		{
			manual: true,
			onSuccess: () => {
				message.success('已成功加入群聊');
				props.onRefresh();
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	if (props.dataSource.status === 1) {
		return (
			<Button
				type="link"
				size="small"
				disabled
			>
				已同意
			</Button>
		);
	}

	return (
		<Button
			type="link"
			size="small"
			onClick={() => {
				modal.confirm({
					title: (
						<>
							<Avatar
								size="small"
								style={{ marginRight: 3 }}
								src={props.dataSource.image_url || DefaultAvatar}
							/>{' '}
							加入群聊
						</>
					),
					icon: <SmileOutlined style={{ color: token.colorSuccess }} />,
					content: <>{props.dataSource.description || '这个家伙什么也没说'}</>,
					okText: '同意',
					onOk: async () => {
						await runAsync();
					},
				});
			}}
		>
			加入群聊
		</Button>
	);
};

export default React.memo(ChatRoomJoin);
