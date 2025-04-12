import { CopyOutlined } from '@ant-design/icons';
import { App, Col, Row, Tooltip } from 'antd';
import type { TooltipPlacement } from 'antd/es/tooltip';
import copy from 'copy-to-clipboard';
import React from 'react';
import styled from 'styled-components';

const copyStyle: React.CSSProperties = {
	backgroundColor: '#fff',
	width: '16px',
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
	cursor: 'pointer',
};

const PRE = styled.pre`
	max-width: 450px;
	max-height: 300px;
	margin: 0;
	white-space: pre-wrap;
	overflow-wrap: break-word;
	overflow: auto;
	::-webkit-scrollbar {
		width: 5px;
		height: 5px;
	}
	::-webkit-scrollbar-thumb {
		border-radius: 20px;
		background-clip: content-box;
		border: 1px solid transparent;
	}
	::-webkit-scrollbar-track {
		background-color: transparent;
	}
`;

interface IProps {
	className?: string;
	style?: React.CSSProperties;
	textStyle?: React.CSSProperties;
	onClick?: React.MouseEventHandler<HTMLDivElement>;
	text?: string;
	tip?: React.ReactNode;
	tipPlacement?: TooltipPlacement;
	copyTip?: React.ReactNode;
}

const EllipsisWithCopy = (props: React.PropsWithChildren<IProps>) => {
	const { message } = App.useApp();

	const { className = '', style } = props;
	if (!props.text) {
		return <span>-</span>;
	}
	return (
		<Row
			align="middle"
			wrap={false}
			className={className}
			style={style}
			onClick={props.onClick}
		>
			<Col
				className={!props.tip ? 'ellipsis' : undefined}
				flex="0 1 auto"
			>
				{props.tip ? (
					<div style={{ display: 'flex' }}>
						<Tooltip
							placement={props.tipPlacement}
							title={<PRE>{props.tip}</PRE>}
						>
							<div
								className="ellipsis"
								style={props.textStyle}
							>
								<span>{props.children}</span>
							</div>
						</Tooltip>
					</div>
				) : (
					<span style={props.textStyle}>{props.children}</span>
				)}
			</Col>
			<Col
				flex="0 0 16px"
				style={copyStyle}
				onClick={ev => {
					ev.stopPropagation();
					if (!props.text) {
						return;
					}
					copy(props.text, { format: 'text/plain', onCopy: () => message.success('已经复制到剪切板') });
				}}
			>
				{props.copyTip ? (
					<Tooltip title={props.copyTip}>
						<CopyOutlined />
					</Tooltip>
				) : (
					<CopyOutlined />
				)}
			</Col>
		</Row>
	);
};

export default EllipsisWithCopy;
