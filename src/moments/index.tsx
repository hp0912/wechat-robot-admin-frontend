import { DeleteFilled, EllipsisOutlined, SettingOutlined } from '@ant-design/icons';
import { useRequest, useSetState } from 'ahooks';
import { App, Avatar, Button, Col, Dropdown, Flex, List, Row, Space, Spin, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
import dayjs from 'dayjs';
import { XMLParser } from 'fast-xml-parser';
import React from 'react';
import styled from 'styled-components';
import type { Api } from '@/api/wechat-robot/wechat-robot';
import { DefaultAvatar } from '@/constant';
import MediaList, { MediaVideo } from './MediaList';
import type { IMoment, ITimeline } from './types';

interface IProps {
	robotId: number;
	robot: Api.V1RobotViewList.ResponseBody['data'];
}

type IContact = Api.V1ContactListList.ResponseBody['data']['items'][number];

interface IPrevState {
	frist_page_md5?: string;
	max_id?: string;
	moments?: IMoment[];
}

const Container = styled.div`
	.moment-nickname {
		color: #4683d0;
	}

	.moment-content {
		margin: 0;
		padding: 0;
		white-space: pre-wrap;
		word-break: break-all;
		color: #090909;
		margin-bottom: 3px;
	}

	.moment-media-list {
		margin-bottom: 3px;
	}

	.moment-delete {
		color: #4683d0;
	}
`;

const Moments = (props: IProps) => {
	const { message, modal } = App.useApp();

	// 单词拼写原本是协议拼错了
	const [prevState, setPrevState] = useSetState<IPrevState>({ frist_page_md5: '', max_id: '0', moments: [] });

	// 记录一下朋友圈ID，避免重复了
	const momentIds = new Set<string>();

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
				const xmlParser = new XMLParser({});
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
					const { Moment: _, ...restProps } = item;
					const moment: IMoment = { ...restProps };
					moment.Moment = xmlParser.parse(item.ObjectDesc?.buffer || '') as ITimeline;
					if (momentIds.has(moment.IdStr!)) {
						const targetIndex = nextState.moments!.findIndex(m => m.IdStr === moment.IdStr);
						if (targetIndex !== -1) {
							nextState.moments![targetIndex] = moment; // 更新已有的朋友圈
						} else {
							nextState.moments!.push(moment);
						}
					} else {
						nextState.moments!.push(moment);
						momentIds.add(moment.IdStr!);
					}
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

	return (
		<Container>
			<Spin spinning={getLoading}>
				<Flex
					justify="space-between"
					align="middle"
					style={{ marginBottom: 16 }}
				>
					<Row
						align="middle"
						wrap={false}
						gutter={8}
					>
						<Col flex="0 0 300px"></Col>
						<Col flex="0 0 260px"></Col>
					</Row>
					<Button
						type="primary"
						style={{ marginRight: 8 }}
						icon={<SettingOutlined />}
						ghost
						onClick={async () => {
							//
						}}
					>
						朋友圈设置
					</Button>
				</Flex>
				<div
					style={{
						border: '1px solid rgba(5,5,5,0.06)',
						borderRadius: 4,
						marginRight: 2,
					}}
				>
					<List
						rowKey="IdStr"
						itemLayout="horizontal"
						dataSource={prevState.moments || []}
						style={{ maxHeight: 'calc(100vh - 235px)', overflowY: 'auto' }}
						renderItem={item => {
							const items: MenuProps['items'] = [];
							console.log('[DEBUG]', item);
							return (
								<List.Item>
									<List.Item.Meta
										avatar={
											<Avatar
												style={{ marginLeft: 8 }}
												src={item.Avatar || DefaultAvatar}
											/>
										}
										title={
											<>
												<span className="moment-nickname">{item.Nickname || item.Username}</span>
											</>
										}
										description={
											<>
												{!!item.Moment?.TimelineObject?.contentDesc && (
													<pre className="moment-content">{item.Moment.TimelineObject.contentDesc}</pre>
												)}
												{Array.isArray(item.Moment?.TimelineObject?.ContentObject?.mediaList?.media) ? (
													<MediaList
														key={item.IdStr}
														className="moment-media-list"
														dataSource={item.Moment.TimelineObject.ContentObject.mediaList.media}
													/>
												) : item.Moment?.TimelineObject?.ContentObject?.mediaList?.media?.id ? (
													<>
														{Number(item.Moment.TimelineObject.ContentObject.mediaList.media.type) === 6 ? (
															<MediaVideo
																dataSource={item.Moment.TimelineObject.ContentObject.mediaList.media}
																videoDownloadUrl={`/api/v1/moments/down-media?id=${props.robotId}&url=${encodeURIComponent(item.Moment.TimelineObject.ContentObject.mediaList.media.url)}`}
															/>
														) : (
															<MediaList
																key={item.IdStr}
																className="moment-media-list"
																dataSource={[item.Moment.TimelineObject.ContentObject.mediaList.media]}
															/>
														)}
													</>
												) : null}
												<Flex
													justify="space-between"
													align="middle"
												>
													<Space>
														<span>{dayjs(Number(item.CreateTime) * 1000).fromNow()}</span>
														<>
															{item.Username === props.robot.wechat_id && (
																<Button
																	key="left"
																	type="text"
																	size="small"
																	icon={
																		<Tooltip title="删除">
																			<DeleteFilled className="moment-delete" />
																		</Tooltip>
																	}
																	onClick={() => {
																		modal.confirm({
																			title: '朋友圈删除确认',
																			content: <>确定要删除这条朋友圈吗？</>,
																			okText: '删除',
																			cancelText: '取消',
																		});
																	}}
																/>
															)}
														</>
													</Space>
													<div style={{ marginRight: 8 }}>
														<Dropdown.Button
															menu={{
																items,
																onClick: () => {
																	//
																},
															}}
															buttonsRender={() => {
																return [
																	null,
																	<Button
																		key="right"
																		type="primary"
																		size="small"
																		ghost
																		icon={<EllipsisOutlined />}
																	/>,
																];
															}}
															onClick={() => {
																//
															}}
														/>
													</div>
												</Flex>
											</>
										}
									/>
								</List.Item>
							);
						}}
					/>
				</div>
			</Spin>
		</Container>
	);
};

export default React.memo(Moments);
