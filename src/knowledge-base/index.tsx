import { Tabs } from 'antd';
import React from 'react';
import ImageKnowledgeBase from '@/image-knowledge-base';
import TextKnowledgeBase from '@/text-knowledge-base';

interface IProps {
	robotId: number;
}

const KnowledgeBaseIndex = (props: IProps) => {
	return (
		<Tabs
			destroyOnHidden
			style={{ marginTop: -16 }}
			items={[
				{
					key: 'text',
					label: '文本知识库',
					children: <TextKnowledgeBase robotId={props.robotId} />,
				},
				{
					key: 'image',
					label: '图片知识库',
					children: <ImageKnowledgeBase robotId={props.robotId} />,
				},
			]}
		/>
	);
};

export default React.memo(KnowledgeBaseIndex);
