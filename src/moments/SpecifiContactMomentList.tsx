import { useRequest, useSetState } from 'ahooks';
import { App, Avatar, Col, Drawer, List, Row, Skeleton, Spin } from 'antd';
import dayjs from 'dayjs';
import React, { useContext } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import type { Api, SnsObject } from '@/api/wechat-robot/wechat-robot';
import { DefaultAvatar } from '@/constant';
import { GlobalContext } from '@/context/global';
import MediaList, { MediaVideo } from './MediaList';
import { Container } from './styled';

interface IProps {
	open?: boolean;
	robotId: number;
	robot: Api.V1RobotViewList.ResponseBody['data'];
	contactAvatar?: string;
	contactId?: string;
	contactName?: string;
	onClose: () => void;
}

interface IState {
	done?: boolean;
	frist_page_md5?: string;
	max_id?: string;
	current_md5?: string;
	current_id?: string;
	moments?: SnsObject[];
}

const SpecifiContactMomentList = (props: IProps) => {
	const { message } = App.useApp();

	const globalContext = useContext(GlobalContext);

	// frist_page_md5 单词拼写原本是协议拼错了
	const [prevState, setPrevState] = useSetState<IState>({ frist_page_md5: '', max_id: '0', moments: [] });

	// 记录一下朋友圈ID，避免重复了
	const momentIds = new Set<string>();

	const { runAsync: loadMoreData, loading: getLoading } = useRequest(
		async (md5?: string, id?: string) => {
			const resp = await window.wechatRobotClient.api.v1MomentsGetDetailList({
				id: props.robotId,
				Towxid: props.contactId!,
				Fristpagemd5: md5 !== undefined ? md5 : prevState.frist_page_md5,
				Maxid: id !== undefined ? id : prevState.max_id,
			});
			if (resp.data.data?.ObjectList?.length) {
				const nextState: IState = { moments: [...(prevState.moments || [])] };
				// 处理朋友圈数据
				resp.data.data.ObjectList.forEach(item => {
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
				if (resp.data.data?.FristPageMd5) {
					nextState.frist_page_md5 = resp.data.data.FristPageMd5;
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
			return resp.data.data;
		},
		{
			manual: false,
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

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
						{props.contactName}的朋友圈
					</Col>
				</Row>
			}
			width={globalContext.global?.isSmallScreen ? '100%' : '80%'}
			open={props.open}
			onClose={props.onClose}
			footer={null}
		>
			<Container>
				<Spin spinning={getLoading}>
					<div
						id="specifi-moments-list"
						style={{
							position: 'relative',
							height: 'calc(100vh - 115px)',
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
							scrollableTarget="specifi-moments-list"
						>
							<List
								rowKey="IdStr"
								itemLayout="horizontal"
								split={false}
								dataSource={prevState.moments || []}
								renderItem={item => {
									const media = item.TimelineObject?.ContentObject?.MediaList?.Media;
									const momentLocation = item.TimelineObject?.Location;

									return (
										<List.Item
											onClick={() => {
												message.info('点击了朋友圈');
											}}
										>
											<Row
												align="top"
												wrap={false}
												style={{ padding: '0 16px' }}
												gutter={[8, 8]}
											>
												<Col flex="0 0 125px">
													<p style={{ margin: 0 }}>
														<b>{dayjs(item.CreateTime! * 1000).format('YYYY年M月D日')}</b>
													</p>
													<p style={{ margin: 0 }}>
														<span style={{ fontSize: 12, color: '#3a3a3a' }}>
															{dayjs(item.CreateTime! * 1000).format('HH:mm')}
														</span>
													</p>
													{(momentLocation?.PoiName || momentLocation?.City || momentLocation?.PoiAddress) && (
														<p style={{ marginTop: 16 }}>
															<span className="moment-location">
																{momentLocation?.PoiName || momentLocation?.City || momentLocation?.PoiAddress}
															</span>
														</p>
													)}
												</Col>
												<Col
													flex="0 0 auto"
													style={{ backgroundColor: '#eeeeee' }}
													onClick={ev => ev.stopPropagation()}
												>
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
												</Col>
												<Col flex="1 1 auto">
													{!!item.TimelineObject?.ContentDesc && (
														<pre className="moment-content">{item.TimelineObject.ContentDesc}</pre>
													)}
												</Col>
											</Row>
										</List.Item>
									);
								}}
							/>
						</InfiniteScroll>
					</div>
				</Spin>
			</Container>
		</Drawer>
	);
};

export default React.memo(SpecifiContactMomentList);
