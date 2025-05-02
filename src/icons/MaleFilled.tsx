import type { AnyType } from '@/common/types';
import { IconGenerator } from './IconGenerator';

const SVG = (props: AnyType) => (
	<svg
		width="1em"
		height="1em"
		fill="currentColor"
		viewBox="0 0 1024 1024"
		{...props}
	>
		<path d="M736 281.6C736 160 633.6 64 512 64 384 64 288 160 288 281.6v44.8C288 454.4 384 640 512 640c121.6 0 224-185.6 224-307.2v-51.2z m153.6 467.2c-64-57.6-192-115.2-217.6-128v19.2c0 121.6-44.8 224-108.8 262.4l-25.6-121.6 25.6-25.6L512 704l-51.2 51.2 25.6 25.6-25.6 121.6c-64-38.4-108.8-140.8-108.8-262.4v-19.2c-32 12.8-153.6 70.4-217.6 128C64 806.4 64 960 64 960H960s0-153.6-70.4-211.2z"></path>
	</svg>
);

export default IconGenerator('MaleFilled', SVG);
