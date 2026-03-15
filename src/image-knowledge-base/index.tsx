import React from 'react';

interface IProps {
	robotId: number;
}

const ImageKnowledgeBase = (props: IProps) => {
	return <div>{props.robotId} 图片知识库</div>;
};

export default React.memo(ImageKnowledgeBase);
