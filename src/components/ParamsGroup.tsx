import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
	position: relative;
	border: 1px solid rgba(5, 5, 5, 0.06);
	border-radius: 6px;
	transition: background-color 0.4s;
	padding: 10px;

	.param-group-title {
		background: #ffffff;
		color: rgba(0, 0, 0, 0.88);
		position: absolute;
		top: -14px;
		padding: 1px 8px;
		border-radius: 6px 6px 0 0;
		transition: background-color 0.4s;
		margin-inline-start: 24px;
		font-weight: 500;
	}
`;

interface IProps {
	className?: string;
	style?: React.CSSProperties;
	title?: React.ReactNode;
	children?: React.ReactElement | React.ReactElement[];
}

const ParamsGroup = (props: IProps) => {
	const { className = '', style, title, children } = props;

	return (
		<Container
			className={className}
			style={style}
		>
			<div className="param-group-title">{title}</div>
			{children}
		</Container>
	);
};

export default ParamsGroup;
