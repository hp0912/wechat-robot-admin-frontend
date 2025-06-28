import React from 'react';

interface IProps {
	id: number;
}

const Moment = (props: IProps) => {
	return <div>{props.id}</div>;
};

export default React.memo(Moment);
