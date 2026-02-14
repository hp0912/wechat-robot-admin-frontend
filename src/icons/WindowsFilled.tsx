import Icon from '@ant-design/icons';
import type { GetProps } from 'antd';
import React from 'react';

type CustomIconComponentProps = GetProps<typeof Icon>;

const SVG: React.FC = () => (
	<svg
		width="1em"
		height="1em"
		fill="currentColor"
		viewBox="0 0 1055 1024"
	>
		<path
			d="M960 58.368H64C23.7568 58.368 0 81.408 0 122.4704v607.9488c0 41.0112 23.7056 64 64 64h384v96.1024H256c-20.1728 0-32 11.4688-32 32v32h575.9488v-32.2048c0-20.48-11.8272-32-32-32h-191.9488v-96h384c40.3456 0 64.0512-23.04 64.0512-64V122.368c0-41.0112-23.7056-64-64-64zM64 634.368V122.368h896v511.9488H64z"
			fill="currentColor"
		></path>
		<path
			d="M694.9888 187.1872l-171.264 28.3648V358.4h171.264V187.1872z m-209.408 31.6416l-139.6736 17.408v122.2144h139.6224V218.8288zM345.856 393.3696v122.1632l139.6224 20.736V393.3696H345.9072z m177.8176 0v146.176l171.264 25.088V393.3696H523.776z"
			fill="currentColor"
		></path>
	</svg>
);

const WindowsFilled: React.FC<Partial<CustomIconComponentProps>> = props => (
	<Icon
		component={SVG}
		{...props}
	/>
);

export default WindowsFilled;
