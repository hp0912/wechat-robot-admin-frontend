import React from 'react';
import KnowledgeBase from '@/knowledge-base/KnowledgeBase';
import KnowledgeDocument from './KnowledgeDocument';

interface IProps {
	robotId: number;
	portalContainer?: HTMLElement | null;
}

const ImageKnowledgeBase = (props: IProps) => {
	return (
		<KnowledgeBase
			robotId={props.robotId}
			type="image"
			KnowledgeDocumentComponent={KnowledgeDocument}
			portalContainer={props.portalContainer}
		/>
	);
};

export default React.memo(ImageKnowledgeBase);
