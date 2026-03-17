import React from 'react';
import KnowledgeBase from '@/knowledge-base';

interface IProps {
	robotId: number;
}

const ImageKnowledgeBase = (props: IProps) => {
	return (
		<KnowledgeBase
			robotId={props.robotId}
			type="image"
		/>
	);
};

export default React.memo(ImageKnowledgeBase);
