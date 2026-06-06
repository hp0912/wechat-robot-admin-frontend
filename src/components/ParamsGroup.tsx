import React from 'react';
import styled from 'styled-components';
import { techCard, techCardHover, theme } from '@/common/tech-theme';

const Container = styled.div`
	${techCard}
	margin-top: 20px;
	padding: 16px 14px 4px;

	&:hover {
		${techCardHover}
	}

	.param-group-title {
		position: absolute;
		top: -13px;
		display: inline-flex;
		align-items: center;
		gap: 7px;
		margin-inline-start: 16px;
		padding: 2px 10px 2px 9px;
		border: 1px solid ${theme.border};
		border-radius: 8px;
		background: ${theme.surface};
		color: ${theme.title};
		font-size: 13px;
		font-weight: 600;
	}

	.param-group-title::before {
		width: 3px;
		height: 12px;
		border-radius: 2px;
		background: linear-gradient(180deg, ${theme.cyan} 0%, ${theme.blue} 100%);
		content: '';
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
