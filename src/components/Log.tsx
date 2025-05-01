import { parse } from 'ansicolor';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { convertUrlsToLinks } from '@/utils';

const Container = styled.div`
	height: calc(100vh - 185px);
	margin-right: 3px;
	border-radius: 4px;
	overflow: auto;
`;

const LogContent = styled.pre`
	position: relative;
	margin: 0;
	padding: 16px;
	background-color: rgb(51, 51, 51);
	border-radius: 4px;
	color: #fff;
	white-space: pre-wrap;
	word-break: break-all;
	font-size: 12px;
`;

interface IProps {
	content?: string;
}

const Log = (props: IProps) => {
	const contentRef = useRef<HTMLPreElement>(null);

	const [logRenderStr, setLogRenderStr] = useState<string>('');

	useEffect(() => {
		const ansiColored = parse(props.content || '');
		let str = '';
		ansiColored.spans.forEach(item => {
			if (item.css) {
				if (item.color?.dim) {
					str += convertUrlsToLinks(item.text);
				} else {
					str += `<span style="${item.css}">${convertUrlsToLinks(item.text)}</span>`;
				}
			} else {
				str += convertUrlsToLinks(item.text);
			}
		});
		setLogRenderStr(str);

		const timer = window.setTimeout(() => {
			if (contentRef.current) {
				contentRef.current.scrollIntoView({ behavior: 'auto', block: 'end', inline: 'nearest' });
			}
		}, 500);
		return () => {
			window.clearTimeout(timer);
		};
	}, [props.content]);

	return (
		<Container>
			<LogContent
				ref={contentRef}
				dangerouslySetInnerHTML={{ __html: logRenderStr }}
			/>
		</Container>
	);
};

export default React.memo(Log);
