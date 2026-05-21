import { FileWordOutlined, GithubOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { App, Avatar, Dropdown, Layout, Skeleton, Watermark } from 'antd';
import type { MenuProps } from 'antd';
import React from 'react';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import logo from '../public/logo.svg';
import { UrlLogin } from './constant/redirect-url';
import { UserContext } from './context/user';

const { Header } = Layout;

const rootStyle: React.CSSProperties = { minHeight: '100vh' };
const headerStyle: React.CSSProperties = {
	position: 'sticky',
	top: 0,
	zIndex: 100,
	width: '100%',
	display: 'flex',
	justifyContent: 'space-between',
	alignItems: 'center',
	paddingLeft: 20,
	paddingRight: 20,
	height: 60,
	lineHeight: '60px',
	background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
	borderBottom: '1px solid rgba(255,255,255,0.08)',
	boxShadow: '0 2px 16px rgba(0,0,0,0.25)',
};

const Logo = styled.div`
	display: flex;
	align-items: center;
	gap: 10px;
	margin-right: 32px;
	cursor: default;
	user-select: none;

	.icon {
		width: 34px;
		height: 34px;
		border-radius: 8px;
		background: url('${logo}') center / contain no-repeat;
		flex-shrink: 0;
		filter: drop-shadow(0 2px 6px rgba(82, 196, 26, 0.4));
	}

	.title {
		color: #ffffff;
		font-weight: 700;
		font-size: 16px;
		letter-spacing: 0.5px;
		white-space: nowrap;

		@media (max-width: 639px) {
			display: none;
		}
	}
`;

const LogoDivider = styled.div`
	width: 1px;
	height: 24px;
	background: rgba(255, 255, 255, 0.15);
	margin-right: 16px;

	@media (max-width: 639px) {
		display: none;
	}
`;

const Nav = styled.nav`
	display: flex;
	align-items: center;
	gap: 4px;

	.nav-item {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 0 16px;
		border-radius: 3px;
		cursor: pointer;
		color: rgba(255, 255, 255, 0.85);
		font-size: 14px;
		font-weight: 500;
		background: rgba(255, 255, 255, 0.08);
		transform: skewX(-12deg);
		transition:
			background 0.2s,
			color 0.2s;

		&:hover {
			background: rgba(255, 255, 255, 0.18);
			color: #ffffff;
		}

		.nav-icon,
		span {
			display: inline-flex;
			align-items: center;
			transform: skewX(12deg);
		}

		.nav-icon {
			font-size: 16px;
		}

		span {
			@media (max-width: 639px) {
				display: none;
			}
		}
	}
`;

const UserArea = styled.div`
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 5px 10px;
	border-radius: 24px;
	cursor: pointer;

	.username {
		color: rgba(255, 255, 255, 0.9);
		font-size: 14px;
		font-weight: 500;
		max-width: 120px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;

		@media (max-width: 1279px) {
			display: none;
		}
	}
`;

const AppLayout: React.FC = () => {
	const { message } = App.useApp();

	// 获取用户详情
	const { data: user, loading: userLoading } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1UserSelfList();
			return resp.data.data;
		},
		{
			manual: false,
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	// 用户登出
	const { runAsync: signOut } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1UserLogoutDelete();
			return resp?.data;
		},
		{
			manual: true,
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	const items: MenuProps['items'] = [
		{
			key: 'signout',
			label: '登出',
			icon: <LogoutOutlined />,
			onClick: async () => {
				const resp = await signOut();
				window.location.href = `${UrlLogin}?login_method=${resp?.data?.login_method ?? 'scan'}&redirect=${encodeURIComponent(window.location.href)}`;
			},
		},
	];

	if (!user || userLoading) {
		return <Skeleton active />;
	}

	return (
		<Watermark
			content={`微信机器人管理后台: ${user.display_name}`}
			font={{ color: 'rgba(0, 0, 0, 0.06)' }}
		>
			<Layout style={rootStyle}>
				<Header style={headerStyle}>
					<div style={{ display: 'flex', alignItems: 'center' }}>
						<Logo>
							<div className="icon" />
							<div className="title">微信机器人管理后台</div>
						</Logo>
						<LogoDivider />
						<Nav>
							<div
								className="nav-item"
								onClick={() => {
									window.open('https://github.com/hp0912/wechat-robot-client', '_blank');
								}}
							>
								<GithubOutlined className="nav-icon" />
								<span>GitHub</span>
							</div>
							<div
								className="nav-item"
								onClick={() => {
									window.open('https://wechat-doc.houhoukang.com', '_blank');
								}}
							>
								<FileWordOutlined className="nav-icon" />
								<span>使用文档</span>
							</div>
						</Nav>
					</div>
					<Dropdown
						menu={{ items }}
						placement="bottomRight"
					>
						<UserArea>
							<Avatar
								size={32}
								gap={4}
								src={user.avatar_url}
								alt={user.display_name}
								icon={<UserOutlined />}
								style={{ backgroundColor: '#0f3460', flexShrink: 0 }}
							/>
							<span className="username">{user.display_name}</span>
						</UserArea>
					</Dropdown>
				</Header>
				<Layout>
					<UserContext.Provider value={{ user: user, signOut }}>
						<Layout style={{ padding: '10px 10px 0 10px' }}>
							<Outlet />
						</Layout>
					</UserContext.Provider>
				</Layout>
			</Layout>
		</Watermark>
	);
};

export default AppLayout;
