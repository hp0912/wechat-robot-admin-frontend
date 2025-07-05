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

const FriendPassVerify = (props: IProps) => {
	const { token } = theme.useToken();
	const { message, modal } = App.useApp();

	const { runAsync } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1ContactFriendPassVerifyCreate(
				{
					id: props.robotId,
					system_message_id: props.dataSource.id,
				},
				{ id: props.robotId },
			);
			return resp.data;
		},
		{
			manual: true,
			onSuccess: () => {
				message.success('已通过好友验证');
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
				已通过
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
							通过好友验证
						</>
					),
					icon: <SmileOutlined style={{ color: token.colorSuccess }} />,
					content: <>{props.dataSource.description || '这个家伙什么也没说'}</>,
					okText: '通过',
					onOk: async () => {
						await runAsync();
					},
				});
			}}
		>
			通过好友验证
		</Button>
	);
};

export default React.memo(FriendPassVerify);
