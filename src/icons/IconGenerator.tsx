/* eslint-disable @typescript-eslint/no-explicit-any */
import Icon from '@ant-design/icons/lib/components/Icon';
import type { CustomIconComponentProps, IconComponentProps } from '@ant-design/icons/lib/components/Icon';
import type { ForwardRefRenderFunction } from 'react';
import React from 'react';

export const IconGenerator = (
	displayName: string,
	component: React.ComponentType<CustomIconComponentProps | React.SVGProps<SVGSVGElement>>,
) => {
	const InternalIcon: ForwardRefRenderFunction<any, IconComponentProps> = (props: any, ref) => {
		return (
			<Icon
				ref={ref as any}
				style={props.style ?? { color: props.fill }}
				component={component}
				{...props}
			/>
		);
	};

	const OuterIcon = React.forwardRef<any, IconComponentProps & { fill?: string }>(InternalIcon);
	OuterIcon.displayName = displayName;

	return OuterIcon;
};
