import React from 'react';
import KnowledgeBase from '@/knowledge-base';

interface IProps {
	robotId: number;
}

const TextKnowledgeBase = (props: IProps) => {
	return (
		<KnowledgeBase
			robotId={props.robotId}
			type="text"
		/>
	);
};

export default React.memo(TextKnowledgeBase);
