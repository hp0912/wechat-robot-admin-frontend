import { AppstoreAddOutlined, PlusOutlined } from '@ant-design/icons';
import { useBoolean, useRequest } from 'ahooks';
import { App, Button, Empty, Pagination, Spin } from 'antd';
import React, { useState } from 'react';
import type * as Api from '@/api/wechat-robot/wechat-robot';
import InstallSkill from './InstallSkill';
import Skill from './Skill';
import SkillsMarket from './SkillsMarket';
import {
	CardsContainer,
	SkillsToolbar,
	SkillsToolbarButton,
	SkillsToolbarIcon,
	SkillsToolbarInfo,
	SkillsToolbarText,
} from './styled';

interface IProps {
	robotId: number;
	robot: NonNullable<Api.Robot.ViewList.ResponseBody['data']>;
}

const Skills = (props: IProps) => {
	const { message } = App.useApp();

	const [onInstallOpen, setInstallOpen] = useBoolean(false);
	const [onSkillsMarketOpen, setSkillsMarketOpen] = useBoolean(false);
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
			<SkillsToolbar>
				<SkillsToolbarInfo>
					<SkillsToolbarIcon>
						<AppstoreAddOutlined />
					</SkillsToolbarIcon>
					<SkillsToolbarText>
						前往{' '}
						<Button
							color="primary"
							variant="link"
							size="small"
							style={{ height: 'auto', paddingInline: 2, fontWeight: 650 }}
							onClick={setSkillsMarketOpen.setTrue}
						>
							技能市场
						</Button>{' '}
						探索更多技能
					</SkillsToolbarText>
				</SkillsToolbarInfo>
				<SkillsToolbarButton
					color="primary"
					variant="filled"
					icon={<PlusOutlined />}
					onClick={setInstallOpen.setTrue}
				>
					安装技能
				</SkillsToolbarButton>
			</SkillsToolbar>
			<div>
				{!data.length ? (
					<Empty
						description={
							<>
								暂无可用技能，前往{' '}
								<Button
									color="primary"
									variant="link"
									size="small"
									style={{ height: 'auto', paddingInline: 2 }}
									onClick={setSkillsMarketOpen.setTrue}
								>
									技能市场
								</Button>{' '}
								安装适合机器人的技能。
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
				{onSkillsMarketOpen && (
					<SkillsMarket
						robotId={props.robotId}
						skills={data}
						open={onSkillsMarketOpen}
						onRefresh={refresh}
						onClose={setSkillsMarketOpen.setFalse}
					/>
				)}
			</div>
		</Spin>
	);
};

export default React.memo(Skills);
