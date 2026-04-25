import { Tabs } from 'antd';
import React, { useState } from 'react';
import ImageKnowledgeBase from '@/image-knowledge-base';
import TextKnowledgeBase from '@/text-knowledge-base';

interface IProps {
	robotId: number;
}

const KnowledgeBaseIndex = (props: IProps) => {
	const [activeKey, setActiveKey] = useState('text');

	const [textExtra, setTextExtra] = useState<HTMLDivElement | null>(null);
	const [imageExtra, setImageExtra] = useState<HTMLDivElement | null>(null);

	const extraContentMap: Record<string, React.ReactNode> = {
		text: <div ref={setTextExtra}></div>,
		image: <div ref={setImageExtra}></div>,
	};

	return (
		<Tabs
			activeKey={activeKey}
			onChange={setActiveKey}
			destroyOnHidden
			style={{ marginTop: -16 }}
			tabBarExtraContent={<div key={activeKey}>{extraContentMap[activeKey]}</div>}
			items={[
				{
					key: 'text',
					label: '文本知识库',
					children: (
						<TextKnowledgeBase
							robotId={props.robotId}
							portalContainer={textExtra}
						/>
					),
				},
				{
					key: 'image',
					label: '图片知识库',
					children: (
						<ImageKnowledgeBase
							robotId={props.robotId}
							portalContainer={imageExtra}
						/>
					),
				},
			]}
		/>
	);
};

export default React.memo(KnowledgeBaseIndex);
