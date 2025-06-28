import React from 'react';
import type { Api } from '@/api/wechat-robot/wechat-robot';

interface IProps {
	robotId: number;
	robot: Api.V1RobotViewList.ResponseBody['data'];
}

const Moments = (props: IProps) => {
	return (
		<div>
			{props.robotId.toString().replace('1', '')}
			{'朋友圈开发中，敬请期待'}
		</div>
	);
};

export default React.memo(Moments);
