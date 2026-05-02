import { theme } from 'antd';
import { XMLParser } from 'fast-xml-parser';
import React from 'react';
import type { Api } from '@/api/wechat-robot/wechat-robot';
import { AppMessageTypeMap, MessageTypeMap } from '@/constant';
import { AppMessageType } from '@/constant/types';
import { MessageType } from '@/constant/types';
import ImageMessage from './ImageMessage';

interface IProps {
	robotId: number;
	message: Api.V1ChatHistoryList.ResponseBody['data']['items'][number];
	chatRoomMembers?: Record<string, string>;
}

interface IReferMsg {
	type: MessageType;
	svrid: string;
	content: string;
	displayname: string;
}

const MessageContent = (props: IProps) => {
	const { token } = theme.useToken();

	const msgType = props.message.type as MessageType;
	const subType = props.message.app_msg_type as AppMessageType;

	if (props.message.is_group && props.message.from_wxid === props.message.sender_wxid) {
		return '[群系统消息]';
	}

	const renderReferMsg = (msg: IReferMsg) => {
		switch (msg.type) {
			case MessageType.Text:
				return (
					<blockquote className="refer-message">
						{msg.displayname}: {msg.content}
					</blockquote>
				);
			case MessageType.Image:
				return <blockquote className="refer-message">{msg.displayname}: [图片消息，暂不支持解析]</blockquote>;
		}
		return <blockquote className="refer-message">{msg.displayname}: [暂不支持的引用消息]</blockquote>;
	};

	switch (msgType) {
		case MessageType.Text:
			return <pre className="text-message">{props.message.content}</pre>;
		case MessageType.Image:
			return (
				<ImageMessage
					robotId={props.robotId}
					message={props.message}
				/>
			);
		case MessageType.Voice:
			return (
				<audio
					controls
					src={`/api/v1/chat/voice/download?id=${props.robotId}&message_id=${props.message.id}`}
				/>
			);
		case MessageType.Emoticon: {
			if (!props.message.content) {
				return '[表情消息] 异常';
			}
			const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' });
			const jsonObj = parser.parse(props.message.content) as {
				msg: {
					emoji: {
						cdnurl: string;
					};
				};
			};
			if (jsonObj.msg && jsonObj.msg.emoji && jsonObj.msg.emoji.cdnurl) {
				return (
					<img
						src={jsonObj.msg.emoji.cdnurl.replaceAll('&amp;', '&').replace(/^http:\/\//, 'https://')}
						alt="[表情消息]"
						style={{ maxWidth: 200, maxHeight: 200 }}
					/>
				);
			}
			return '[表情消息] 异常';
		}
		case MessageType.App: {
			try {
				const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' });
				const jsonObj = parser.parse(props.message.content) as {
					msg?: {
						appmsg?: {
							type: AppMessageType;
							title: string;
							refermsg?: IReferMsg;
						};
					};
				};
				if (jsonObj.msg && jsonObj.msg.appmsg) {
					const appmsg = jsonObj.msg.appmsg;
					if (appmsg.type === AppMessageType.AppMsgTypequote) {
						return (
							<>
								{renderReferMsg(appmsg.refermsg!)}
								<pre className="text-message">{appmsg.title}</pre>
							</>
						);
					}
				}
			} catch {
				//
			}
			if (props.message.display_full_content) {
				return props.message.display_full_content;
			}
			return `[${AppMessageTypeMap[subType] || '未知消息'}]`;
		}
		case MessageType.Sysmsg: {
			if (!props.message.content) {
				return '[未知消息]';
			}
			try {
				const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' });
				const jsonObj = parser.parse(props.message.content) as {
					sysmsg?: {
						pat?: {
							fromusername: string;
							pattedusername: string;
							patsuffix: string;
						};
						revokemsg?: {
							session: string;
							replacemsg: string;
						};
						secmsg?: object;
					};
				};
				if (jsonObj.sysmsg && typeof jsonObj.sysmsg === 'object') {
					if (jsonObj.sysmsg.pat) {
						const pat = jsonObj.sysmsg.pat;
						return `"${props.chatRoomMembers?.[pat.fromusername] || pat.fromusername}" 拍了拍 "${props.chatRoomMembers?.[pat.pattedusername] || pat.pattedusername}" ${pat.patsuffix}`;
					}
					if (jsonObj.sysmsg.revokemsg) {
						const revokemsg = jsonObj.sysmsg.revokemsg;
						return revokemsg.replacemsg || '[消息已撤回]';
					}
					if (jsonObj.sysmsg.secmsg) {
						return <span style={{ color: token.colorWarning }}>[微信内部风控/展示元数据通知]</span>;
					}
				}
			} catch {
				//
			}
			if (props.message.display_full_content) {
				return props.message.display_full_content;
			}
			return '[未知消息]';
		}
		default: {
			if (props.message.display_full_content) {
				return props.message.display_full_content;
			}
			return `[${MessageTypeMap[msgType] || '未知消息'}]`;
		}
	}
};

export default React.memo(MessageContent);
