import React from 'react';

interface IProps {
	robotId: number;
}

const TextKnowledgeBase = (props: IProps) => {
	return <div>{props.robotId > 0 ? '敬请期待~' : '敬请期待~'}</div>;
};

export default React.memo(TextKnowledgeBase);
