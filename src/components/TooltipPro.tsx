import { Tooltip } from 'antd';
import React, { memo } from 'react';
import styled from 'styled-components';
import { URLPattern } from '@/constant/regexp';

const PRE = styled.pre`
	max-width: 450px;
	max-height: 300px;
	margin: 0;
	white-space: pre-wrap;
	overflow-wrap: break-word;
	overflow: auto;
	&::-webkit-scrollbar {
		width: 5px;
		height: 5px;
	}
	&::-webkit-scrollbar-thumb {
		border-radius: 20px;
		background-clip: content-box;
		border: 1px solid transparent;
	}
	&::-webkit-scrollbar-track {
		background-color: transparent;
	}
`;

const TooltipPro = (props: { content?: string; style?: React.CSSProperties }) => {
	const { content } = props;
	return (
		<div style={{ display: 'flex' }}>
			{content === undefined || content === null || content === '' ? (
				<span>-</span>
			) : (
				<Tooltip
					placement="topRight"
					title={
						content.length < 500 && !content.includes('script') ? (
							<PRE
								dangerouslySetInnerHTML={{
									__html: content.replace(
										URLPattern,
										"$1<a href='$2' target='_blank' rel='noopener noreferrer'>$2</a>",
									),
								}}
							/>
						) : (
							<PRE style={{ maxWidth: 450, maxHeight: 300, margin: 0, overflow: 'auto' }}>{content}</PRE>
						)
					}
				>
					<div
						className="ellipsis"
						style={props.style}
					>
						<span>{content}</span>
					</div>
				</Tooltip>
			)}
		</div>
	);
};

export default memo(TooltipPro);
