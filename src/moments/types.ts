import type { Api } from '@/api/wechat-robot/wechat-robot';

export type IMomentItem = Omit<Api.V1MomentsListList.ResponseBody['data']['ObjectList'][number], 'Moment'>;

export interface IMoment extends IMomentItem {
	Moment?: ITimeline;
}

export interface ITimeline {
	TimelineObject: MomentInfo;
}

export interface MomentInfo {
	id: string;
	username: string;
	createTime: string;
	contentDesc: string;
	contentDescShowType: number;
	contentDescScene: number;
	private: string;
	sightFolded?: number;
	showFlag?: number;
	contentattr?: string;
	sourceUserName: string;
	sourceNickName: string;
	publicUserName: string;
	publicBrandContactType?: number;
	statisticsData: string;
	statExtStr?: string;
	canvasInfoXml?: string;
	appInfo: AppInfo;
	weappInfo?: WeappInfo;
	ContentObject: ContentObject;
	actionInfo: ActionInfo;
	location: Location;
	streamvideo: StreamVideo;
}

interface AppInfo {
	id: string;
	version?: string;
	appName?: string;
	installUrl?: string;
	fromUrl?: string;
	isForceUpdate?: number;
	isHidden?: number;
}

interface WeappInfo {
	appUserName: string;
	pagePath: string;
	version: string;
	isHidden: number;
	debugMode: string;
	shareActionId: string;
	isGame: string;
	messageExtraData: string;
	subType: string;
	preloadResources: string;
}

interface ContentObject {
	contentStyle: string;
	contentSubStyle?: string;
	title: string;
	description: string;
	contentUrl: string;
	mediaList: MediaList;
}

interface MediaList {
	media: Media | Media[];
}

export interface Media {
	id: string;
	type: string;
	title: string;
	description: string;
	private: string;
	userData?: string;
	subType?: string;
	videoSize?: VideoSize;
	hd?: URL;
	uhd?: URL;
	url: URL;
	thumb: Thumb;
	size: Size;
	videoDuration?: string;
	VideoColdDLRule?: VideoColdDLRule;
}

interface VideoSize {
	width: string;
	height: string;
}

export interface URL {
	type: string;
	md5: string;
	videomd5: string;
	value: string;
}

export interface Thumb {
	type: string;
	value: string;
}

interface Size {
	width: string;
	height: string;
	totalSize: string;
}

interface VideoColdDLRule {
	All: string;
}

interface ActionInfo {
	appMsg: AppMsg;
}

interface AppMsg {
	mediaTagName?: string;
	messageExt?: string;
	messageAction: string;
}

interface Location {
	poiClassifyId: string;
	poiName: string;
	poiAddress: string;
	poiClassifyType: string;
	city: string;
}

interface StreamVideo {
	streamvideourl: string;
	streamvideothumburl: string;
	streamvideoweburl: string;
}
