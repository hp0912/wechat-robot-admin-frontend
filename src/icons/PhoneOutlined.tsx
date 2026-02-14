import Icon from '@ant-design/icons';
import type { GetProps } from 'antd';
import React from 'react';

type CustomIconComponentProps = GetProps<typeof Icon>;

const SVG: React.FC = () => (
	<svg
		width="1em"
		height="1em"
		fill="currentColor"
		viewBox="0 0 1024 1024"
	>
		<path
			d="M258.56 48.128c-8.192 4.096-22.016 14.336-30.72 23.04l-15.36 16.384v848.896l15.36 16.384c28.672 30.72 26.112 30.208 284.16 30.208s255.488 0.512 284.16-30.208l15.36-16.384V87.552l-15.36-16.384c-29.184-30.72-26.112-30.208-285.184-30.208-186.88 0.512-240.128 2.048-252.416 7.168zM732.16 419.84v307.2H291.84V112.64h440.32v307.2z m-194.048 386.56c17.92 9.728 35.328 35.84 35.328 53.76 0 28.672-33.28 61.44-62.464 61.44-27.136 0-60.416-33.792-60.416-61.44s33.28-61.44 60.416-61.44c6.656 0 18.432 3.584 27.136 7.68z"
			fill="currentColor"
		></path>
	</svg>
);

const PhoneOutlined: React.FC<Partial<CustomIconComponentProps>> = props => (
	<Icon
		component={SVG}
		{...props}
	/>
);

export default PhoneOutlined;
