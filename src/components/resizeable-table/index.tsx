import { Table, theme } from 'antd';
import type { TableProps } from 'antd';
import type { ColumnType } from 'antd/es/table';
import React, { useState } from 'react';
import type { ResizeCallbackData } from 'react-resizable';
import { Resizable } from 'react-resizable';
import styled from 'styled-components';
import type { AnyType } from '@/common/types';

export type ScrollConfig = {
	index?: number;
	key?: React.Key;
	top?: number;
};

export type Reference = {
	nativeElement: HTMLDivElement;
	scrollTo: (config: ScrollConfig) => void;
};

interface IProps<T> extends TableProps<T> {
	children?: React.ReactNode;
	ref?: React.Ref<Reference>;
}

const Container = styled.div<{ $themeColor: string }>`
	th.ant-table-cell {
		user-select: none;
	}
	.react-resizable {
		position: relative;
		background-clip: padding-box;
	}
	.react-resizable-handle {
		position: absolute;
		right: -5px;
		bottom: 0;
		z-index: 1;
		width: 10px;
		height: 100%;
		cursor: col-resize;
	}
	a {
		color: rgba(0, 0, 0, 0.8);
	}
	.ant-table-tbody > tr.ant-table-row:hover > td a {
		color: ${props => props.$themeColor};
	}
`;

const ResizableTitle = (
	props: React.HTMLAttributes<AnyType> & {
		onResize: (e: React.SyntheticEvent<Element>, data: ResizeCallbackData) => void;
		onResizeStop?: (e: React.SyntheticEvent, data: ResizeCallbackData) => AnyType;
		width: number;
	},
) => {
	const { onResize, onResizeStop, width, ...restProps } = props;

	if (!width) {
		return <th {...restProps} />;
	}

	return (
		<Resizable
			width={width}
			height={0}
			handle={
				<span
					className="react-resizable-handle"
					onClick={e => {
						e.stopPropagation();
					}}
				/>
			}
			onResize={onResize}
			onResizeStop={onResizeStop}
			draggableOpts={{ enableUserSelectHack: false }}
		>
			<th {...restProps} />
		</Resizable>
	);
};

const ResizeableTable = <T extends object>(props: IProps<T>) => {
	const { token } = theme.useToken();

	const { columns, ...restProps } = props;
	const [resizeColumns, setResizeColumns] = useState(columns);

	const handleResize =
		(index: number) =>
		(_: React.SyntheticEvent<Element>, { size }: ResizeCallbackData) => {
			if (size.width <= 50 || size.width > 1200) {
				return;
			}
			setResizeColumns(prev => {
				if (!prev) {
					return [];
				}
				const nextColumns = [...prev];
				nextColumns[index] = { ...nextColumns[index], width: size.width };
				return nextColumns;
			});
		};

	const mergeColumns: typeof columns = resizeColumns?.map((col, index) => ({
		...col,
		onHeaderCell: (column: ColumnType<AnyType>) => {
			const width = typeof column.width === 'number' ? column.width : Number(column?.width?.replace('px', ''));
			const canResize = width && width > 50;
			return {
				width: column.width,
				onResize: canResize ? (handleResize(index) as React.ReactEventHandler<AnyType>) : () => undefined,
			};
		},
	}));

	const mergeComponents: TableProps<T>['components'] = {
		...props.components,
		header: {
			...props.components?.header,
			cell: ResizableTitle,
		},
	};

	return (
		<Container $themeColor={token.colorPrimary}>
			<Table
				{...restProps}
				className={`${props.className || ''}`}
				columns={mergeColumns}
				components={mergeComponents}
			/>
		</Container>
	);
};

export default ResizeableTable;
