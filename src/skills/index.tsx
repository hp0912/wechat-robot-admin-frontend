import { PlusOutlined } from '@ant-design/icons';
import { useBoolean, useRequest, useSize } from 'ahooks';
import { App, Button, Empty, List, Spin, Tooltip } from 'antd';
import VirtualList from 'rc-virtual-list';
import React, { useRef } from 'react';
import InstallSkill from './InstallSkill';
import SkillActions from './SkillActions';

interface IProps {
	robotId: number;
}

const Skills = (props: IProps) => {
	const { message } = App.useApp();

	const [onInstallOpen, setInstallOpen] = useBoolean(false);

	const containerRef = useRef<HTMLDivElement>(null);
	const containerSize = useSize(containerRef);

	const { data, loading, refresh } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1SkillsList({
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
				style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 16, paddingRight: 8 }}
			>
				<Button
					type="primary"
					ghost
					icon={<PlusOutlined />}
					onClick={setInstallOpen.setTrue}
				>
					安装技能
				</Button>
			</div>
			<div
				style={{ height: 'calc(100vh - 188px)', overflow: 'auto' }}
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
							itemKey={item => item.metadata.name}
						>
							{item => {
								return (
									<List.Item key={item.metadata.name}>
										<List.Item.Meta
											title={item.metadata.name}
											description={
												<Tooltip
													styles={{
														container: {
															width: 750,
														},
													}}
													title={item.metadata.description}
													placement="topLeft"
												>
													<div className="ellipsis">{item.metadata.description}</div>
												</Tooltip>
											}
										/>
										<div>
											<SkillActions
												robotId={props.robotId}
												skill={item}
												onRefresh={refresh}
											/>
										</div>
									</List.Item>
								);
							}}
						</VirtualList>
					</List>
				)}
				{onInstallOpen && (
					<InstallSkill
						robotId={props.robotId}
						open={onInstallOpen}
						onRefresh={refresh}
						onClose={setInstallOpen.setFalse}
					/>
				)}
			</div>
		</Spin>
	);
};

export default React.memo(Skills);
