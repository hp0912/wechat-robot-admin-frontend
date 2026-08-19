import {
	AppstoreAddOutlined,
	BgColorsOutlined,
	DownloadOutlined,
	GlobalOutlined,
	MessageOutlined,
	ReadOutlined,
	ReloadOutlined,
	SearchOutlined,
	ThunderboltOutlined,
} from '@ant-design/icons';
import { useMemoizedFn, useRequest } from 'ahooks';
import { App, Avatar, Button, Card, Col, Empty, Flex, Input, Modal, Row, Space, Tag, theme, Typography } from 'antd';
import React, { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { DtoSkill } from '@/api/wechat-robot/wechat-robot';
import { SKILL_MARKET_BASE_URL, SKILL_MARKET_ITEMS } from './skillsMarketData';
import type { ISkillMarketItem, SkillMarketCategory } from './skillsMarketData';

interface IProps {
	robotId: number;
	skills: DtoSkill[];
	open: boolean;
	onRefresh: () => void;
	onClose: () => void;
}

const CATEGORY_ICONS: Record<SkillMarketCategory, ReactNode> = {
	内容理解: <ReadOutlined />,
	效率工具: <ThunderboltOutlined />,
	会话能力: <MessageOutlined />,
	信息查询: <GlobalOutlined />,
	智能创作: <BgColorsOutlined />,
};

const SkillsMarket = (props: IProps) => {
	const { message, modal } = App.useApp();
	const { token } = theme.useToken();

	const [keyword, setKeyword] = useState('');

	const installedSkillNames = useMemo(() => {
		return new Set(props.skills.map(skill => skill.metadata?.name).filter((name): name is string => Boolean(name)));
	}, [props.skills]);

	const filteredSkills = useMemo(() => {
		const normalizedKeyword = keyword.trim().toLowerCase();
		if (!normalizedKeyword) {
			return SKILL_MARKET_ITEMS;
		}
		return SKILL_MARKET_ITEMS.filter(skill => {
			return [skill.name, skill.title, skill.description, skill.category]
				.filter(Boolean)
				.some(value => value.toLowerCase().includes(normalizedKeyword));
		});
	}, [keyword]);

	const { runAsync: onClientRestart } = useRequest(
		async () => {
			await window.wechatRobotClient.robot.restartClientCreate(
				{ id: props.robotId },
				{
					id: props.robotId,
				},
			);
		},
		{
			manual: true,
			onSuccess: () => {
				message.success('重启客户端成功');
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	const showRestartConfirm = useMemoizedFn((actionText: '安装' | '更新') => {
		modal.confirm({
			title: `${actionText}成功`,
			content: `需要重启客户端以启用${actionText === '安装' ? '新技能' : '最新版本'}，是否立即重启？`,
			width: 400,
			okText: '立即重启',
			cancelText: '稍后重启',
			onOk: async () => {
				await onClientRestart();
				await new Promise(resolve => setTimeout(resolve, 6000));
				props.onRefresh();
			},
			onCancel: () => {
				props.onRefresh();
			},
		});
	});

	const {
		runAsync: onSkillAction,
		loading: skillActionLoading,
		params: skillActionParams,
	} = useRequest(
		async (skill: ISkillMarketItem, installed: boolean) => {
			if (installed) {
				await window.wechatRobotClient.skills.updateUpdate(
					{
						id: props.robotId,
					},
					{
						name: skill.name,
					},
				);
			} else {
				await window.wechatRobotClient.skills.installCreate(
					{
						id: props.robotId,
					},
					{
						url: `${SKILL_MARKET_BASE_URL}/${skill.name}`,
					},
				);
			}
		},
		{
			manual: true,
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	const showSkillActionConfirm = useMemoizedFn((skill: ISkillMarketItem, installed: boolean) => {
		const actionText = installed ? '更新' : '安装';
		modal.confirm({
			title: `${actionText}技能`,
			content: (
				<>
					确认{actionText}技能 <Typography.Text strong>{skill.title}</Typography.Text> 吗？
				</>
			),
			width: 380,
			okText: actionText,
			cancelText: '取消',
			onOk: async () => {
				await onSkillAction(skill, installed);
				showRestartConfirm(actionText);
			},
		});
	});

	const activeSkillName = skillActionLoading && skillActionParams.length ? skillActionParams[0].name : '';

	return (
		<Modal
			title={
				<Space size={8}>
					<AppstoreAddOutlined />
					<span>技能市场</span>
				</Space>
			}
			width="min(960px, calc(100vw - 32px))"
			open={props.open}
			footer={null}
			onCancel={props.onClose}
		>
			<Flex
				align="center"
				justify="space-between"
				gap={12}
				style={{ marginBlock: 16 }}
			>
				<Input
					allowClear
					prefix={<SearchOutlined />}
					placeholder="搜索技能名称、用途或分类"
					value={keyword}
					style={{ maxWidth: 360 }}
					onChange={event => setKeyword(event.target.value)}
				/>
				<Typography.Text type="secondary">
					{keyword.trim() ? `找到 ${filteredSkills.length} 个技能` : '全部技能'}
				</Typography.Text>
			</Flex>
			<div style={{ maxHeight: 'min(62vh, 620px)', overflowY: 'auto', padding: 2 }}>
				{filteredSkills.length > 0 ? (
					<Row gutter={[12, 12]}>
						{filteredSkills.map(skill => {
							const installed = installedSkillNames.has(skill.name);
							return (
								<Col
									key={skill.name}
									xs={24}
									md={12}
								>
									<Card
										size="small"
										styles={{
											body: {
												padding: 14,
											},
										}}
										style={{ height: '100%' }}
									>
										<Flex
											align="center"
											gap={12}
										>
											<Avatar
												shape="square"
												size={36}
												icon={CATEGORY_ICONS[skill.category]}
												style={{
													flex: '0 0 auto',
													backgroundColor: token.colorPrimaryBg,
													border: `1px solid ${token.colorPrimaryBorder}`,
													color: token.colorPrimary,
												}}
											/>
											<Flex
												vertical
												flex={1}
												gap={5}
												style={{ minWidth: 0 }}
											>
												<Flex
													align="center"
													gap={6}
													wrap
												>
													<Typography.Text strong>{skill.title}</Typography.Text>
													<Tag variant="filled">{skill.category}</Tag>
													{installed && (
														<Tag
															color="success"
															variant="filled"
														>
															已安装
														</Tag>
													)}
												</Flex>
												<Typography.Paragraph
													type="secondary"
													ellipsis={{ rows: 2 }}
													style={{ minHeight: 44, marginBottom: 0 }}
													title={skill.description}
												>
													{skill.description}
												</Typography.Paragraph>
											</Flex>
											<Button
												color={installed ? 'orange' : 'primary'}
												variant="filled"
												size="small"
												icon={installed ? <ReloadOutlined /> : <DownloadOutlined />}
												loading={skillActionLoading && activeSkillName === skill.name}
												disabled={skillActionLoading && activeSkillName !== skill.name}
												onClick={() => showSkillActionConfirm(skill, installed)}
											>
												{installed ? '更新' : '安装'}
											</Button>
										</Flex>
									</Card>
								</Col>
							);
						})}
					</Row>
				) : (
					<Empty
						image={Empty.PRESENTED_IMAGE_SIMPLE}
						description="没有找到匹配的技能"
					/>
				)}
			</div>
		</Modal>
	);
};

export default React.memo(SkillsMarket);
