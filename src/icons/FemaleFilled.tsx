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
			d="M614.272 629.952v-11.328h152.96c-19.52-186.24 11.52-528.512-255.296-528.512-266.688 0-235.712 342.336-255.232 528.512h152.96v11.2h-0.256l-266.24 174.976a70.336 70.336 0 0 0 38.656 129.088h661.12a69.568 69.568 0 0 0 38.4-127.68L614.272 629.952z m7.808 188.672c-72.96 70.592-110.656-36.8-110.656-36.8s-37.696 107.328-110.72 36.8c0 0-32-20.736-35.52-159.872l146.24 123.072 146.24-123.072c-3.456 139.072-35.584 159.872-35.584 159.872z"
			fill="currentColor"
		></path>
	</svg>
);

const FemaleFilled: React.FC<Partial<CustomIconComponentProps>> = props => (
	<Icon
		component={SVG}
		{...props}
	/>
);

export default FemaleFilled;
