import { Drawer } from 'antd';
import React from 'react';
import type { Api } from '@/api/wechat-robot/wechat-robot';

type IKnowledgeBase = NonNullable<Api.V1KnowledgeCategoriesList.ResponseBody['data']>[number];

interface IProps {
	robotId: number;
	knowledgeBase: IKnowledgeBase;
	open: boolean;
	onClose: () => void;
}

const KnowledgeDocument = (props: IProps) => {
	return (
		<Drawer
			title={`${props.knowledgeBase.name} - 知识库图片管理`}
			open={props.open}
			onClose={props.onClose}
			size="min(99vw, 75vw)"
			styles={{ header: { paddingTop: 12, paddingBottom: 12 }, body: { paddingTop: 16, paddingBottom: 0 } }}
			footer={null}
		>
			敬请期待
		</Drawer>
	);
};

export default React.memo(KnowledgeDocument);
