import { useRequest, useSize } from 'ahooks';
import { App, Empty, List, Spin } from 'antd';
import VirtualList from 'rc-virtual-list';
import React, { useRef } from 'react';
import MCPServerActions from './MCPServerActions';

interface IProps {
	robotId: number;
}

const MCPServers = (props: IProps) => {
	const { message } = App.useApp();

	const containerRef = useRef<HTMLDivElement>(null);
	const containerSize = useSize(containerRef);

	const { data, loading } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1McpServerListList({
				id: props.robotId,
			});
			return resp.data?.data;
		},
		{
			manual: false,
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	return (
		<Spin spinning={loading}>
			<div
				style={{ height: 'calc(100vh - 140px)', overflow: 'auto' }}
				ref={containerRef}
			>
				{!data?.length ? (
					<Empty />
				) : (
					<List bordered>
						<VirtualList
							data={data}
							height={containerSize?.height ? containerSize.height - 2 : 0}
							itemHeight={47}
							itemKey="id"
						>
							{item => (
								<List.Item key={item.id}>
									<List.Item.Meta
										title={item.name}
										description={item.description}
									/>
									<div>
										<MCPServerActions mcpServer={item} />
									</div>
								</List.Item>
							)}
						</VirtualList>
					</List>
				)}
			</div>
		</Spin>
	);
};

export default React.memo(MCPServers);
