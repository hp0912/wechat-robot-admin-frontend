import React from 'react';
import KnowledgeBase from '@/knowledge-base';
import KnowledgeDocument from './KnowledgeDocument';

interface IProps {
	robotId: number;
}

const ImageKnowledgeBase = (props: IProps) => {
	return (
		<KnowledgeBase
			robotId={props.robotId}
			type="image"
			KnowledgeDocumentComponent={KnowledgeDocument}
		/>
	);
};

export default React.memo(ImageKnowledgeBase);
