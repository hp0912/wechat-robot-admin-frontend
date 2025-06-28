import { useRequest, useSetState } from 'ahooks';
import { App, Spin } from 'antd';
import { XMLParser } from 'fast-xml-parser';
import React from 'react';
import type { Api } from '@/api/wechat-robot/wechat-robot';

interface IProps {
	robotId: number;
	robot: Api.V1RobotViewList.ResponseBody['data'];
}

type IContact = Api.V1ContactListList.ResponseBody['data']['items'][number];
type IMomentItem = Api.V1MomentsListList.ResponseBody['data']['ObjectList'][number];

interface IPrevState {
	frist_page_md5?: string;
	max_id?: string;
	moments?: IMomentItem[];
}

const Moments = (props: IProps) => {
	const { message } = App.useApp();

	// 单词拼写原本是协议拼错了
	const [prevState, setPrevState] = useSetState<IPrevState>({ frist_page_md5: '', max_id: '0', moments: [] });

	const { runAsync: getContacts } = useRequest(
		async (contactIds: string[]) => {
			const resp = await window.wechatRobotClient.api.v1ContactListList({
				id: props.robotId,
				type: 'friend',
				contact_ids: contactIds,
				page_index: 1,
				page_size: 10,
			});
			return resp.data?.data;
		},
		{
			manual: true,
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	const { loading: getLoading } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1MomentsListList({
				id: props.robotId,
				frist_page_md5: prevState.frist_page_md5,
				max_id: prevState.max_id,
			});
			if (resp.data.data?.ObjectList?.length) {
				const nextState: IPrevState = { moments: [...(prevState.moments || [])] };
				// 获取联系人头像
				const contactIds = [
					...new Set(resp.data.data.ObjectList.map(item => item.Username).filter(item => !!item)),
				] as string[];
				const contactMap: Record<string, IContact> = {};
				try {
					const contactResp = await getContacts(contactIds);
					(contactResp.items || []).forEach(item => {
						contactMap[item.wechat_id!] = item;
					});
				} catch {
					//
				}
				// 处理朋友圈数据
				resp.data.data.ObjectList.forEach(item => {
					if (item.Username === props.robot.wechat_id) {
						// 机器人自己账号发的朋友圈
						item.Avatar = props.robot.avatar;
					} else if (contactMap[item.Username!]) {
						item.Avatar = contactMap[item.Username!].avatar;
						if (contactMap[item.Username!].remark) {
							item.Nickname = contactMap[item.Username!].remark;
						}
					}
					nextState.moments!.push(item);
				});

				const len = resp.data.data.ObjectList.length;
				if (resp.data.data?.FirstPageMd5) {
					nextState.frist_page_md5 = resp.data.data.FirstPageMd5;
				}
				if (resp.data.data?.ObjectList?.length) {
					nextState.max_id = resp.data.data.ObjectList[len - 1].IdStr!;
				}

				setPrevState(nextState);
			}
		},
		{
			manual: false,
			onError: reason => {
				message.error(reason.message);
			},
		},
	);
	console.log('朋友圈数据', prevState.moments);
	console.log(new XMLParser().parse('<root>test</root>'));
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
