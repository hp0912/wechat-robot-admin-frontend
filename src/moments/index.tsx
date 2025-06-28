import { useRequest } from 'ahooks';
import { App, Spin } from 'antd';
import React, { useState } from 'react';
import type { Api } from '@/api/wechat-robot/wechat-robot';

interface IProps {
	robotId: number;
	robot: Api.V1RobotViewList.ResponseBody['data'];
}

const Moments = (props: IProps) => {
	const { message } = App.useApp();

	// 单词拼写原本是协议拼错了
	const [prevState, setPrevState] = useState({ frist_page_md5: '', max_id: '0' });

	const { loading: getLoading } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1MomentsListList({
				id: props.robotId,
				frist_page_md5: prevState.frist_page_md5,
				max_id: prevState.max_id,
			});
			if (resp.data.data?.ObjectList?.length) {
				const len = resp.data.data.ObjectList.length;
				setPrevState({
					frist_page_md5: resp.data.data.FirstPageMd5,
					max_id: resp.data.data.ObjectList[len - 1].Id!,
				});
			}
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
			<Spin spinning={getLoading}>
				{props.robotId.toString().replace('1', '')}
				{'朋友圈开发中，敬请期待'}
			</Spin>
		</div>
	);
};

export default React.memo(Moments);
