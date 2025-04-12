import { Badge, Col, Popover, Row } from 'antd';
import { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import type { AnyType } from '@/common/types';

interface IProps<T extends string | number> {
	dataSource: Record<string, AnyType>[];
	idPros: string;
	nameProp: string;
	baseUrl?: string;
	onItemClick?: (v: T) => void;
}

export const PopContainer = styled.div`
	min-width: 70px;
	max-width: 400px;
	max-height: 400px;
	overflow-y: auto;
	.more-item {
		padding: 2px 5px;
		border-radius: 2px;
		display: flex;
		justify-content: flex-start;
		align-items: center;
		flex: 1;
		a {
			display: inline-block;
			width: 100%;
		}
	}
	.more-item:hover {
		background-color: #f5f5f5;
	}
`;

const MoreItem = <T extends string | number>(
	props: Omit<IProps<T>, 'dataSource' | 'idPros' | 'nameProp'> & { data: { id: T; name: string } },
) => {
	if (props.baseUrl) {
		return <Link to={`${props.baseUrl}${props.data.id}`}>{props.data.name}</Link>;
	} else if (props.onItemClick) {
		return <a onClick={() => props.onItemClick?.(props.data.id)}>{props.data.name}</a>;
	}
	return <span>{props.data.name}</span>;
};

const MorePopover = <T extends string | number>(props: IProps<T>) => {
	const { dataSource = [], idPros, nameProp, baseUrl } = props;

	const dataSourceParsed = useMemo<Array<{ id: T; name: string }>>(() => {
		if (!dataSource) {
			return [];
		}
		return dataSource.map(item => {
			return { id: item[idPros], name: item[nameProp] };
		});
	}, [dataSource, idPros, nameProp]);

	if (!dataSourceParsed.length) {
		return <span>-</span>;
	}
	if (dataSourceParsed.length === 1) {
		return (
			<MoreItem<T>
				baseUrl={baseUrl}
				data={dataSourceParsed[0]}
				onItemClick={props.onItemClick}
			/>
		);
	}
	return (
		<Row
			align="middle"
			wrap={false}
		>
			<Col
				flex="0 1 auto"
				className="ellipsis"
			>
				<MoreItem<T>
					baseUrl={baseUrl}
					data={dataSourceParsed[0]}
					onItemClick={props.onItemClick}
				/>
			</Col>
			<Col
				flex="0 0 auto"
				style={{ display: 'flex', alignItems: 'center' }}
			>
				<Popover
					trigger="hover"
					placement="topRight"
					content={
						<PopContainer>
							{dataSourceParsed.map(item => {
								return (
									<div
										key={item.id}
										className="ellipsis more-item"
									>
										<MoreItem<T>
											baseUrl={baseUrl}
											data={item}
											onItemClick={props.onItemClick}
										/>
									</div>
								);
							})}
						</PopContainer>
					}
				>
					<Badge
						style={{ marginLeft: 3, cursor: 'pointer' }}
						count={dataSourceParsed.length}
						color="#bababa"
					/>
				</Popover>
			</Col>
		</Row>
	);
};

export default memo(MorePopover);
