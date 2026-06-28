import { AppstoreAddOutlined, PlusOutlined } from '@ant-design/icons';
import { useBoolean, useRequest } from 'ahooks';
import { App, Button, Empty, Flex, Pagination, Space, Spin } from 'antd';
import React, { useState } from 'react';
import type * as Api from '@/api/wechat-robot/wechat-robot';
import InstallSkill from './InstallSkill';
import Skill from './Skill';
import { CardsContainer } from './styled';

interface IProps {
	robotId: number;
	robot: NonNullable<Api.Robot.ViewList.ResponseBody['data']>;
}

const Skills = (props: IProps) => {
	const { message } = App.useApp();

	const [onInstallOpen, setInstallOpen] = useBoolean(false);
	const [pageIndex, setPageIndex] = useState(1);

	const {
		data = [],
		loading,
		refresh,
	} = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.skills.skillsList({
				id: props.robotId,
			});
			return resp.data?.data || [];
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
			<Flex
				justify="space-between"
				align="center"
				style={{ marginBottom: 16, padding: 8, border: '1px solid #22d3ee2e', borderRadius: 6 }}
			>
				<Space style={{ color: '#0958d9' }}>
					<AppstoreAddOutlined />
					<span>
						前往
						<a
							style={{ color: '#E4DA11' }}
							href="https://git.houhoukang.com/houhou/wechat-robot-skills"
							target="_blank"
							rel="noopener noreferrer"
						>
							技能市场
						</a>
						探索更多技能...
					</span>
				</Space>
				<Button
					color="primary"
					variant="filled"
					icon={<PlusOutlined />}
					onClick={setInstallOpen.setTrue}
				>
					安装技能
				</Button>
			</Flex>
			<div>
				{!data.length ? (
					<Empty
						description={
							<>
								暂无可用技能，前往{' '}
								<a
									href="https://git.houhoukang.com/houhou/wechat-robot-skills"
									target="_blank"
									rel="noopener noreferrer"
								>
									Skills
								</a>{' '}
								技能市场探索海量技能。
							</>
						}
					/>
				) : (
					<CardsContainer>
						{data.slice((pageIndex - 1) * 10, pageIndex * 10).map((item, index) => {
							return (
								<Skill
									key={item.metadata?.name || index}
									robotId={props.robotId}
									skill={item}
									onRefresh={refresh}
								/>
							);
						})}
					</CardsContainer>
				)}
				<div className="pagination">
					<Pagination
						align="end"
						size="small"
						current={pageIndex}
						pageSize={10}
						total={data.length}
						showSizeChanger={false}
						showTotal={total => `共 ${total} 条`}
						onChange={page => {
							setPageIndex(page);
						}}
					/>
				</div>
				{onInstallOpen && (
					<InstallSkill
						robotId={props.robotId}
						robot={props.robot}
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
