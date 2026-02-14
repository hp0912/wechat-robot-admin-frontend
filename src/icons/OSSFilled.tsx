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
			d="M783.4 388.5c-3.1 0-6.2 0.1-9.2 0.2 0.1-3.1 0.2-6.2 0.2-9.4 0-145.8-117.7-263.9-263-263.9-133 0-243 99.2-260.5 227.9C148.3 349 67 434.3 67 538.6c0 106.5 84.9 193.2 190.4 195.6v0.1h32.9c68.8-5.8 225.2-36.6 226.3-196.7l-67.5 48.1-31-37.2 126-98.1L662 553.3l-37.8 35.2-61.7-51.5c-0.8 39.7-13 138.2-109.5 197.2h339.3v-0.2c90.9-4.7 163.2-80.2 163.2-172.7 0.2-95.4-77-172.8-172.1-172.8z"
			fill="currentColor"
		></path>
	</svg>
);

const OSSFilled: React.FC<Partial<CustomIconComponentProps>> = props => (
	<Icon
		component={SVG}
		{...props}
	/>
);

export default OSSFilled;
