import { ArrowUpOutlined, DeleteFilled, EllipsisOutlined, SettingOutlined } from '@ant-design/icons';
import { useRequest, useSetState } from 'ahooks';
import { App, Avatar, Button, Col, Dropdown, Flex, List, Row, Skeleton, Space, Spin, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import styled from 'styled-components';
import type { Api } from '@/api/wechat-robot/wechat-robot';
import { DefaultAvatar } from '@/constant';
import MediaList, { MediaVideo } from './MediaList';

interface IProps {
	robotId: number;
	robot: Api.V1RobotViewList.ResponseBody['data'];
}

type IContact = Api.V1ContactListList.ResponseBody['data']['items'][number];
type IMoment = Api.V1MomentsListList.ResponseBody['data']['ObjectList'][number];

interface IPrevState {
	done?: boolean;
	frist_page_md5?: string;
	max_id?: string;
	current_md5?: string;
	current_id?: string;
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

	.moment-location {
		color: #4683d0;
	}

	.moment-delete {
		color: #4683d0;
	}

	.moment-likes {
	}

	.moment-comments {
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

	const { runAsync: loadMoreData, loading: getLoading } = useRequest(
		async (md5?: string, id?: string) => {
			const resp = await window.wechatRobotClient.api.v1MomentsListList({
				id: props.robotId,
				frist_page_md5: md5 !== undefined ? md5 : prevState.frist_page_md5,
				max_id: id !== undefined ? id : prevState.max_id,
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
					if (momentIds.has(item.IdStr!)) {
						const targetIndex = nextState.moments!.findIndex(m => m.IdStr === item.IdStr);
						if (targetIndex !== -1) {
							nextState.moments![targetIndex] = item; // 更新已有的朋友圈
						} else {
							nextState.moments!.push(item);
						}
					} else {
						nextState.moments!.push(item);
						momentIds.add(item.IdStr!);
					}
				});

				const len = resp.data.data.ObjectList.length;
				nextState.current_id = id !== undefined ? id : nextState.max_id;
				nextState.current_md5 = md5 !== undefined ? md5 : nextState.frist_page_md5;
				if (resp.data.data?.FirstPageMd5) {
					nextState.frist_page_md5 = resp.data.data.FirstPageMd5;
				}
				if (resp.data.data?.ObjectList?.length) {
					nextState.max_id = resp.data.data.ObjectList[len - 1].IdStr!;
				}
				if (len < 10) {
					nextState.done = true; // 没有更多数据了
				} else {
					nextState.done = false; // 还有更多数据
				}

				setPrevState(nextState);
			} else {
				setPrevState({ done: true });
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
					<Space>
						<Button
							type="primary"
							icon={<ArrowUpOutlined />}
							ghost
							onClick={() => {
								setPrevState({ done: false, max_id: '0', frist_page_md5: '', moments: [] });
								setTimeout(() => {
									loadMoreData();
								}, 60);
							}}
						>
							返回朋友圈首页
						</Button>
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
					</Space>
				</Flex>
				<div
					id="moments-list"
					style={{
						height: 'calc(100vh - 185px)',
						overflowY: 'auto',
						border: '1px solid rgba(5,5,5,0.06)',
						borderRadius: 4,
						marginRight: 2,
					}}
				>
					<InfiniteScroll
						dataLength={prevState.moments?.length || 0}
						next={loadMoreData}
						hasMore={!prevState.done}
						loader={
							<div style={{ padding: '0 8px' }}>
								<Skeleton
									avatar
									paragraph={{ rows: 1 }}
									active
								/>
							</div>
						}
						endMessage={<div style={{ textAlign: 'center', padding: '12px 8px' }}>加载完了...</div>}
						scrollableTarget="moments-list"
					>
						<List
							rowKey="IdStr"
							itemLayout="horizontal"
							dataSource={prevState.moments || []}
							renderItem={item => {
								const items: MenuProps['items'] = [];
								const media = item.TimelineObject?.ContentObject?.MediaList?.Media;
								const momentLocation = item.TimelineObject?.Location;
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
													{!!item.TimelineObject?.ContentDesc && (
														<pre className="moment-content">{item.TimelineObject.ContentDesc}</pre>
													)}
													{Array.isArray(media) ? (
														<>
															{media.length === 1 && Number(media[0].Type) === 6 ? (
																<MediaVideo
																	dataSource={media[0]}
																	videoDownloadUrl={`/api/v1/moments/down-media?id=${props.robotId}&url=${encodeURIComponent(media[0]!.URL!.Value!)}`}
																/>
															) : (
																<MediaList
																	className="moment-media-list"
																	dataSource={media}
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
															{(momentLocation?.PoiName || momentLocation?.City || momentLocation?.PoiAddress) && (
																<span className="moment-location">
																	{momentLocation?.PoiName || momentLocation?.City || momentLocation?.PoiAddress}
																</span>
															)}
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
													{/* 只有点赞数据 */}
													{!!item.LikeCount && !item.CommentCount && <div className="moment-likes"></div>}
													{/* 只有评论数据 */}
													{!item.LikeCount && !!item.CommentCount && <div className="moment-comments"></div>}
													{/* 有评论、点赞数据 */}
													{!!item.LikeCount && !!item.CommentCount && null}
												</>
											}
										/>
									</List.Item>
								);
							}}
						/>
					</InfiniteScroll>
				</div>
			</Spin>
		</Container>
	);
};

export default React.memo(Moments);
