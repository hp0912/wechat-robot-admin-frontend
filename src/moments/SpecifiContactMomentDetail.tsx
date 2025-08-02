import { CloseCircleFilled, DeleteFilled, EllipsisOutlined, HeartFilled, HeartOutlined } from '@ant-design/icons';
import { useMemoizedFn, useRequest, useSetState } from 'ahooks';
import { App, Avatar, Button, Col, Drawer, Dropdown, Empty, Flex, List, Row, Space, Spin, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
import dayjs from 'dayjs';
import React, { useContext, useRef } from 'react';
import type { Api, SnsObject } from '@/api/wechat-robot/wechat-robot';
import { DefaultAvatar } from '@/constant';
import { GlobalContext } from '@/context/global';
import CommentFilled from '@/icons/CommentFilled';
import CommentOutlined from '@/icons/CommentOutlined';
import GroupFilled from '@/icons/GroupFilled';
import CommentMoment from './CommentMoment';
import MediaList, { MediaVideo } from './MediaList';
import { Container } from './styled';

interface IProps {
	open?: boolean;
	robotId: number;
	robot: Api.V1RobotViewList.ResponseBody['data'];
	contactAvatar?: string;
	contactId?: string;
	contactName?: string;
	momentId: string;
	onRefresh: () => void;
	onClose: () => void;
}

interface ICommentState {
	open?: boolean;
	momentId?: string;
	replyCommnetId?: number;
	replyContent?: string;
}

type IContact = Api.V1ContactListList.ResponseBody['data']['items'][number];

const SpecifiContactMomentDetail = (props: IProps) => {
	const { message, modal } = App.useApp();

	const globalContext = useContext(GlobalContext);

	const [commentState, setCommentState] = useSetState<ICommentState>({});

	const commentUserMap = new Map<string, string>();
	const contactMap = useRef<Record<string, IContact>>({});

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

	const { data, loading, refresh } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1MomentsGetIdDetailList({
				id: props.robotId,
				Towxid: props.contactId!,
				MomentId: props.momentId,
			});
			const snsObject = resp.data.data?.object;
			if (!snsObject) {
				return snsObject;
			}
			const contactIds = [
				...new Set([
					...(snsObject.LikeUserList?.map(item => item.Username).filter(item => !!item) || []),
					...(snsObject.CommentUserList?.map(item => item.Username).filter(item => !!item) || []),
					props.contactId!, // 用来判断当前朋友圈所有者是不是自己的好友
				]),
			] as string[];
			if (contactIds.length === 0) {
				return snsObject;
			}
			const _contactMap: Record<string, IContact> = {};
			// 把当前登录机器人也添加进去
			_contactMap[props.robot.wechat_id] = {
				wechat_id: props.robot.wechat_id,
				nickname: props.robot.nickname,
				avatar: props.robot.avatar || DefaultAvatar,
			};
			try {
				const contactResp = await getContacts(contactIds);
				(contactResp.items || []).forEach(item => {
					_contactMap[item.wechat_id!] = item;
				});
				contactMap.current = _contactMap;
			} catch {
				//
			}
			return snsObject;
		},
		{
			manual: false,
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	const { runAsync: momentOp } = useRequest(
		async (type: number, momentId: string, commentId?: number) => {
			const resp = await window.wechatRobotClient.api.v1MomentsOperateCreate(
				{
					id: props.robotId,
					Type: type,
					MomentID: momentId,
					CommentId: commentId,
				},
				{
					id: props.robotId,
				},
			);
			return resp.data?.data;
		},
		{
			manual: true,
			onSuccess: (_, params) => {
				switch (params[0]) {
					case 1:
						message.success('删除朋友圈成功');
						props.onRefresh();
						props.onClose();
						break;
					case 2:
						message.success('设为隐私成功');
						refresh();
						break;
					case 3:
						message.success('设为公开成功');
						refresh();
						break;
					case 4:
						message.success('删除评论成功');
						refresh();
						break;
					case 5:
						message.success('取消点赞成功');
						refresh();
						break;
					default:
					//
				}
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	const { runAsync: momentComment } = useRequest(
		async (type: number, momentId: string, content?: string, replyCommnetId?: number) => {
			const resp = await window.wechatRobotClient.api.v1MomentsCommentCreate(
				{
					id: props.robotId,
				},
				{
					id: props.robotId,
					MomentId: momentId,
					Type: type,
					ReplyCommnetId: replyCommnetId as number,
					Content: content,
				},
			);
			return resp.data?.data;
		},
		{
			manual: true,
			onSuccess: (resp, params) => {
				switch (params[0]) {
					case 1:
						message.success('点赞成功');
						refresh();
						break;
				}
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	const onCommentMomentClose = useMemoizedFn(() => {
		setCommentState({ open: false, momentId: undefined, replyCommnetId: undefined });
	});

	const items: MenuProps['items'] = [];
	if (contactMap.current[props.contactId!]) {
		items.push({
			label: (
				<>
					<CommentOutlined style={{ marginRight: 8 }} />
					评论
				</>
			),
			key: 'comment',
		});
	}
	if (data?.LikeFlag === 1) {
		items.unshift({
			label: (
				<>
					<HeartFilled style={{ color: '#ff4d4f', marginRight: 8 }} />
					取消点赞
				</>
			),
			key: 'unlike',
		});
	} else if (contactMap.current[props.contactId!]) {
		items.unshift({
			label: (
				<>
					<HeartOutlined style={{ marginRight: 8 }} />
					点赞
				</>
			),
			key: 'like',
		});
	}

	const getPrivateText = (item: SnsObject) => {
		return !item.TimelineObject?.Private ? '设为隐私' : '设为公开';
	};

	const renderLikes = (item: SnsObject) => {
		return (
			<Row
				align="top"
				wrap={false}
				gutter={[0, 3]}
			>
				<Col flex="0 0 20px">
					<HeartOutlined className="like" />
				</Col>
				<Col flex="1 1 auto">
					<Space
						size={3}
						wrap
					>
						{item.LikeUserList!.map(user => {
							return (
								<Avatar
									key={user.Username}
									shape="square"
									src={contactMap.current[user.Username!]?.avatar || DefaultAvatar}
								/>
							);
						})}
					</Space>
				</Col>
			</Row>
		);
	};

	const renderComments = (item: SnsObject) => {
		return (
			<Row
				align="top"
				wrap={false}
				gutter={[0, 3]}
			>
				<Col flex="0 0 20px">
					<CommentOutlined className="comment" />
				</Col>
				<Col flex="1 1 auto">
					{item.CommentUserList!.map(item2 => {
						commentUserMap.set(item2.Username!, item2.Nickname!);
						if (item2.DeleteFlag === 1) {
							return null;
						}
						return (
							<Row
								className="comment-item specific-contact-comment-item"
								align="top"
								wrap={false}
								gutter={[0, 3]}
								key={`${item2.CommentFlag}-${item2.CommentId}-${item2.CommentId2}`}
							>
								<Col flex="0 0 40px">
									<Avatar
										key={item2.Username}
										shape="square"
										src={contactMap.current[item2.Username!]?.avatar || DefaultAvatar}
									/>
								</Col>
								<Col flex="1 1 auto">
									<Flex
										justify="space-between"
										align="center"
									>
										<b className="user">{commentUserMap.get(item2.Username!) || item2.Username}</b>
										<span style={{ fontSize: 12, color: 'gray' }}>
											{dayjs(Number(item2.CreateTime) * 1000).format('YYYY-MM-DD HH:mm:ss')}
										</span>
									</Flex>
									{!!item2.ReplyUsername && (
										<>
											<span>
												{' '}
												@ <b className="user">{commentUserMap.get(item2.ReplyUsername) || item2.ReplyUsername}</b>
											</span>
											<span>: </span>
										</>
									)}
									<span className="comment">{item2.Content}</span>
									{item2.Username === props.robot.wechat_id ? (
										<CloseCircleFilled
											className="delete-comment"
											onClick={async () => {
												modal.confirm({
													title: '删除评论',
													content: (
														<>
															<p style={{ color: '#5c5c5c' }}>{item2.Content}</p>
															<p>确定要删除这条评论吗？</p>
														</>
													),
													okText: '删除',
													onOk: async () => {
														// 删除评论
														await momentOp(4, item.IdStr!, item2.CommentId);
													},
												});
											}}
										/>
									) : contactMap.current[props.contactId!] ? ( // 当前朋友圈所有者是好友
										<CommentFilled
											className="reply-comment"
											onClick={() => {
												setCommentState({
													open: true,
													momentId: item.IdStr!,
													replyCommnetId: item2.CommentId,
													replyContent: item2.Content,
												});
											}}
										/>
									) : null}
								</Col>
							</Row>
						);
					})}
				</Col>
			</Row>
		);
	};

	return (
		<Drawer
			title={
				<Row
					align="middle"
					wrap={false}
				>
					<Col flex="0 0 32px">
						<Avatar src={props.contactAvatar || DefaultAvatar} />
					</Col>
					<Col
						flex="0 1 auto"
						className="ellipsis"
						style={{ padding: '0 3px' }}
					>
						{props.contactName}的朋友圈详情
					</Col>
				</Row>
			}
			width={globalContext.global?.isSmallScreen ? '100%' : '80%'}
			open={props.open}
			onClose={props.onClose}
			footer={null}
		>
			<Spin spinning={loading}>
				<Container
					style={{
						border: '1px solid rgba(5,5,5,0.06)',
						borderRadius: 4,
					}}
				>
					{data ? (
						<List
							rowKey="IdStr"
							itemLayout="horizontal"
							dataSource={[data]}
							renderItem={item => {
								const media = item.TimelineObject?.ContentObject?.MediaList?.Media;
								const momentLocation = item.TimelineObject?.Location;

								return (
									<List.Item>
										<List.Item.Meta
											avatar={
												<Avatar
													style={{ marginLeft: 8 }}
													src={props.contactAvatar || DefaultAvatar}
												/>
											}
											title={
												<>
													<span className="moment-nickname">{props.contactName}</span>
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
														<Space size="small">
															<span>{dayjs(Number(item.CreateTime) * 1000).format('YYYY-MM-DD HH:mm:ss')}</span>
															{(momentLocation?.PoiName || momentLocation?.City || momentLocation?.PoiAddress) && (
																<span className="moment-location">
																	{momentLocation?.PoiName || momentLocation?.City || momentLocation?.PoiAddress}
																</span>
															)}
															{item.Username === props.robot.wechat_id && (
																<Tooltip title={getPrivateText(item)}>
																	<GroupFilled
																		className="moment-privacy"
																		style={!item.TimelineObject?.Private ? {} : { color: '#5c5959' }}
																		onClick={() => {
																			modal.confirm({
																				title: getPrivateText(item),
																				width: 330,
																				content: <>确定要将这条朋友圈{getPrivateText(item)}吗？</>,
																				okText: getPrivateText(item),
																				onOk: async () => {
																					// 当前公开，设为隐私
																					if (!item.TimelineObject?.Private) {
																						await momentOp(2, item.IdStr!);
																						refresh();
																						return;
																					}
																					// 设为公开
																					await momentOp(3, item.IdStr!);
																					refresh();
																				},
																				cancelText: '取消',
																			});
																		}}
																	/>
																</Tooltip>
															)}
															{item.Username === props.robot.wechat_id && (
																<Tooltip title="删除">
																	<DeleteFilled
																		className="moment-delete"
																		onClick={() => {
																			modal.confirm({
																				title: '朋友圈删除确认',
																				content: <>确定要删除这条朋友圈吗？</>,
																				okText: '删除',
																				onOk: async () => {
																					await momentOp(1, item.IdStr!);
																				},
																				cancelText: '取消',
																			});
																		}}
																	/>
																</Tooltip>
															)}
														</Space>
														<div style={{ marginRight: 8 }}>
															<Dropdown.Button
																menu={{
																	items,
																	onClick: async ev => {
																		switch (ev.key) {
																			case 'like':
																				await momentComment(1, item.IdStr!);
																				break;
																			case 'unlike':
																				// 设为公开
																				await momentOp(5, item.IdStr!);
																				break;
																			case 'comment':
																				setCommentState({
																					open: true,
																					momentId: item.IdStr!,
																					replyCommnetId: undefined,
																					replyContent: undefined,
																				});
																				break;
																		}
																	},
																}}
																buttonsRender={() => {
																	return [
																		null,
																		items.length === 0 ? null : (
																			<Button
																				key="right"
																				type="primary"
																				size="small"
																				ghost
																				icon={<EllipsisOutlined />}
																			/>
																		),
																	];
																}}
																onClick={() => {
																	//
																}}
															/>
														</div>
													</Flex>
													{/* 只有点赞数据 */}
													{!!item.LikeUserList?.length && !item.CommentUserList?.length && (
														<div className="moment-likes">{renderLikes(item)}</div>
													)}
													{/* 只有评论数据 */}
													{!item.LikeUserList?.length && !!item.CommentUserList?.length && (
														<div className="moment-comments">{renderComments(item)}</div>
													)}
													{/* 有评论、点赞数据 */}
													{!!item.LikeUserList?.length && !!item.CommentUserList?.length && (
														<div className="moment-actions">
															<div className="likes">{renderLikes(item)}</div>
															<div className="comments">{renderComments(item)}</div>
														</div>
													)}
												</>
											}
										/>
									</List.Item>
								);
							}}
						/>
					) : (
						<Empty />
					)}
					{commentState.open && (
						<CommentMoment
							open={commentState.open}
							robotId={props.robotId}
							momentId={commentState.momentId!}
							replyCommnetId={commentState.replyCommnetId}
							replyContent={commentState.replyContent}
							onRefresh={refresh}
							onClose={onCommentMomentClose}
						/>
					)}
				</Container>
			</Spin>
		</Drawer>
	);
};

export default React.memo(SpecifiContactMomentDetail);
