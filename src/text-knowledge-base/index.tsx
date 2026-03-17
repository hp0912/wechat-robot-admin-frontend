import React from 'react';
import KnowledgeBase from '@/knowledge-base';
import KnowledgeDocument from './KnowledgeDocument';

interface IProps {
	robotId: number;
}

const TextKnowledgeBase = (props: IProps) => {
	return (
		<KnowledgeBase
			robotId={props.robotId}
			type="text"
			KnowledgeDocumentComponent={KnowledgeDocument}
		/>
	);
};

export default React.memo(TextKnowledgeBase);
