import { CloseOutlined } from '@ant-design/icons';
import { Col, Popover, Row } from 'antd';
import type { Select, SelectProps } from 'antd';
import type { ComponentProps } from 'react';
import styled from 'styled-components';

export const maxTagPlaceholder: SelectProps['maxTagPlaceholder'] = omittedValues => {
	if (!omittedValues || omittedValues.length === 0) {
		return null;
	}
	return (
		<Popover
			placement="top"
			content={
				<div style={{ minWidth: 80, maxWidth: 450, maxHeight: 300, overflow: 'auto' }}>
					{omittedValues.map(item => (
						<p key={item.key || item.value}>{item.label}</p>
					))}
				</div>
			}
		>
			+{omittedValues.length}...
		</Popover>
	);
};

const PopoverContentContainer = styled.div`
	::-webkit-scrollbar {
		width: 10px;
		height: 14px;
	}
	min-width: 80px;
	max-width: 450px;
	max-height: 300px;
	overflow: auto;
	.popover-item {
		padding: 4px;
		border-radius: 4px;
	}
	.popover-item:hover {
		background-color: #f5f5f5;
	}
`;

export const maxTagPlaceholderPro = (props: ComponentProps<typeof Select>) => {
	const fn: SelectProps['maxTagPlaceholder'] = omittedValues => {
		if (!omittedValues || omittedValues.length === 0) {
			return null;
		}
		return (
			<Popover
				placement="top"
				content={
					<PopoverContentContainer
						onMouseDown={ev => {
							ev.preventDefault();
							ev.stopPropagation();
						}}
					>
						{omittedValues.map(item => {
							if (props.disabled) {
								return <p key={item.key || item.value}>{item.label}</p>;
							}
							return (
								<Row
									key={item.key || item.value}
									align="middle"
									wrap={false}
									className="popover-item"
								>
									<Col
										flex="1 1 auto"
										className="content-ellipsis"
									>
										<p style={{ margin: '3px 0' }}>{item.label}</p>
									</Col>
									<Col
										flex="0 1 auto"
										style={{ display: 'flex', alignItems: 'center' }}
									>
										<CloseOutlined
											style={{
												marginLeft: 4,
												color: '#00000073',
												fontSize: 12,
												fontWeight: 700,
											}}
											onClick={() => {
												if (props.onChange && Array.isArray(props.value)) {
													props.onChange(
														props.value.filter(v => {
															if (props.labelInValue) {
																return v.value !== item.value;
															} else {
																return v !== item.value;
															}
														}),
														{ label: item.label, value: item.value },
													);
												}
											}}
										/>
									</Col>
								</Row>
							);
						})}
					</PopoverContentContainer>
				}
			>
				+{omittedValues.length}...
			</Popover>
		);
	};
	return fn;
};
