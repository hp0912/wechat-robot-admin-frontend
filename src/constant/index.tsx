import { MessageType } from './types';

export const DefaultAvatar = 'https://img.houhoukang.com/robot-default-avatar.svg';

export const MessageTypeMap: Record<MessageType, string> = {
	[MessageType.Text]: '文本消息',
	[MessageType.Image]: '图片消息',
	[MessageType.Voice]: '语音消息',
	[MessageType.Verify]: '认证消息',
	[MessageType.PossibleFriend]: '好友推荐消息',
	[MessageType.ShareCard]: '名片消息',
	[MessageType.Video]: '视频消息',
	[MessageType.Emoticon]: '表情消息',
	[MessageType.Location]: '地理位置消息',
	[MessageType.App]: 'APP消息',
	[MessageType.Voip]: 'VOIP消息',
	[MessageType.Init]: '微信初始化消息',
	[MessageType.VoipNotify]: 'VOIP结束消息',
	[MessageType.VoipInvite]: 'VOIP邀请',
	[MessageType.MicroVideo]: '小视频消息',
	[MessageType.Unknow]: '未知消息',
	[MessageType.Sys]: '系统消息',
	[MessageType.Recalled]: '消息撤回',
};
