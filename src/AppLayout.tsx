import { GithubOutlined, LogoutOutlined } from '@ant-design/icons';
import { useRequest, useSize } from 'ahooks';
import { App, Avatar, Divider, Dropdown, Layout, Skeleton, Space, Watermark } from 'antd';
import type { MenuProps } from 'antd';
import logo from 'public/logo.svg';
import React, { useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import { UrlLogin } from './constant/redirect-url';
import { GlobalContext } from './context/global';
import type { IGlobalContext } from './context/global';
import { UserContext } from './context/user';

const { Header } = Layout;

const rootStyle: React.CSSProperties = { minHeight: '100vh' };
const headerStyle: React.CSSProperties = {
	position: 'sticky',
	top: 0,
	zIndex: 1,
	width: '100%',
	display: 'flex',
	justifyContent: 'space-between',
	alignItems: 'center',
	paddingRight: 40,
	backgroundColor: '#bfb68b',
};

const Logo = styled.div`
	width: 250px;
	display: flex;
	align-items: center;
	justify-content: flex-start;

	.icon {
		margin: 0 auto;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: url('${logo}') center / contain no-repeat;
	}

	.title {
		width: 180px;
		height: 32px;
		margin-inline-end: 24px;
		color: #000000;
		font-weight: 600;
		font-size: 18px;
		line-height: 32px;
		vertical-align: middle;
	}
`;

const AppLayout: React.FC = () => {
	const { message } = App.useApp();

	const bodySize = useSize(document.body);
	const isSmallScreen = (bodySize?.width || 0) < 1280;

	const globalState = useMemo<IGlobalContext>(() => {
		return { global: { isSmallScreen } };
	}, [isSmallScreen]);

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
				window.location.href = `${UrlLogin}?redirect=${encodeURIComponent(window.location.href)}`;
			},
		},
	);

	// 用户登出
	const { runAsync: signOut } = useRequest(
		async () => {
			await window.wechatRobotClient.api.v1UserLogoutDelete();
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
				await signOut();
				window.location.href = `${UrlLogin}?redirect=${encodeURIComponent(window.location.href)}`;
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
					<Logo>
						<div className="icon" />
						<div className="title">微信机器人管理后台</div>
					</Logo>
					<Space split={<Divider type="vertical" />}>
						<GithubOutlined
							className="github-icon"
							onClick={() => {
								window.open('https://github.com/hp0912/wechat-robot-client', '_blank');
							}}
						/>
						<Dropdown
							menu={{ items }}
							placement="bottomRight"
						>
							<div>
								<Avatar
									style={{ verticalAlign: 'middle', backgroundColor: 'rgb(132, 132, 131)' }}
									size="default"
									gap={4}
									src={user.avatar_url}
									alt={user.display_name}
								/>
								{isSmallScreen ? null : (
									<span style={{ color: '#000000', marginLeft: 5, fontSize: 15 }}>{user.display_name}</span>
								)}
							</div>
						</Dropdown>
					</Space>
				</Header>
				<Layout>
					<GlobalContext.Provider value={globalState}>
						<UserContext.Provider value={{ user: user, signOut }}>
							<Layout style={{ padding: '10px 10px 0 10px' }}>
								<Outlet />
							</Layout>
						</UserContext.Provider>
					</GlobalContext.Provider>
				</Layout>
			</Layout>
		</Watermark>
	);
};

export default AppLayout;
