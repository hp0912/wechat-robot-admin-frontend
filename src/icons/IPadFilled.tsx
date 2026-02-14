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
			d="M938.667 128H85.333C38.4 128 0 166.4 0 213.333v597.334C0 857.6 38.4 896 85.333 896h853.334C985.6 896 1024 857.6 1024 810.667V213.333C1024 166.4 985.6 128 938.667 128zM64 546.133c-17.067 0-34.133-17.066-34.133-34.133S46.933 477.867 64 477.867 98.133 494.933 98.133 512 85.333 546.133 64 546.133zM896 768H128V256h768v512z"
			fill="currentColor"
		></path>
		<path
			d="M657.067 593.067l-21.334 42.666c-12.8 21.334-34.133 51.2-59.733 51.2-21.333 0-29.867-12.8-59.733-12.8-29.867 0-38.4 12.8-59.734 12.8-25.6 0-42.666-25.6-59.733-46.933-38.4-59.733-42.667-132.267-21.333-170.667 17.066-25.6 46.933-42.666 72.533-42.666s42.667 12.8 64 12.8 34.133-12.8 64-12.8c21.333 0 46.933 12.8 64 34.133-46.933 25.6-38.4 110.933 17.067 132.267zM558.933 396.8c12.8-12.8 21.334-34.133 17.067-55.467-17.067 0-38.4 12.8-51.2 29.867-12.8 12.8-21.333 34.133-17.067 51.2 21.334 0 38.4-8.533 51.2-25.6z"
			fill="currentColor"
		></path>
	</svg>
);

const IPadFilled: React.FC<Partial<CustomIconComponentProps>> = props => (
	<Icon
		component={SVG}
		{...props}
	/>
);

export default IPadFilled;
