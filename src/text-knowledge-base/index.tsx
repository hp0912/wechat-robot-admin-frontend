import React from 'react';
import KnowledgeBase from '@/knowledge-base/KnowledgeBase';
import KnowledgeDocument from './KnowledgeDocument';

interface IProps {
	robotId: number;
	portalContainer?: HTMLElement | null;
}

const TextKnowledgeBase = (props: IProps) => {
	return (
		<KnowledgeBase
			robotId={props.robotId}
			type="text"
			KnowledgeDocumentComponent={KnowledgeDocument}
			portalContainer={props.portalContainer}
		/>
	);
};

export default React.memo(TextKnowledgeBase);
