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
			d="M337.36192 914.688c-3.5584 0-7.13728-0.75776-10.496-2.304-8.89856-4.096-14.61248-12.99968-14.61248-22.8096L312.25344 782.5408c0-13.29152-10.81344-24.09984-24.12544-24.09984l-122.88 0c-41.00096 0-74.35264-33.3568-74.35264-74.33216L90.89536 235.6992c0-40.9856 33.35168-74.33728 74.35264-74.33728l708.80768 0c40.97536 0 74.32704 33.35168 74.32704 74.33728l0 448.41472c0 40.97536-33.35168 74.33216-74.32704 74.33216l-336.19968 0c-5.76 0-11.35104 2.048-15.73888 5.8368l-168.41728 144.3584C349.06112 912.62464 343.24992 914.688 337.36192 914.688z"
			fill="currentColor"
		></path>
	</svg>
);

const CommentFilled: React.FC<Partial<CustomIconComponentProps>> = props => (
	<Icon
		component={SVG}
		{...props}
	/>
);

export default CommentFilled;
