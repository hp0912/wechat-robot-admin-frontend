import { LogoutOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { App, Avatar, Dropdown, Layout, Menu, Skeleton, theme, Watermark } from 'antd';
import type { MenuProps } from 'antd';
import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { UrlLogin } from './constant/redirect-url';
import { UserContext } from './context/user';

const { Header, Sider } = Layout;

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
};
const siderStyle: React.CSSProperties = {
	overflow: 'auto',
	height: 'calc(100vh - 64px)',
	position: 'sticky',
	insetInlineStart: 0,
	top: 64,
	bottom: 0,
	scrollbarWidth: 'thin',
	scrollbarGutter: 'stable',
};

const AppLayout: React.FC = () => {
	const {
		token: { colorBgContainer },
	} = theme.useToken();
	const { message } = App.useApp();
	const navigate = useNavigate();

	const [selectedKeys, setselectedKeys] = useState<string[]>([]);

	useEffect(() => {
		const pathname = window.location.pathname;
		if (!pathname) {
			setselectedKeys([]);
		} else {
			let routeKey = '';
			if (pathname.startsWith('UrlPrefix')) {
				routeKey = pathname.split('/').slice(1, 3).join('/');
			} else {
				routeKey = pathname.split('/')[1];
			}
			setselectedKeys([`/${routeKey}`]);
		}
	}, []);

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
					<div className="logo">微信机器人管理后台</div>
					<Dropdown
						menu={{ items }}
						placement="bottomRight"
					>
						<div>
							<Avatar
								style={{ verticalAlign: 'middle', backgroundColor: 'rgb(132, 132, 131)' }}
								size="default"
								gap={4}
							>
								{(user?.display_name || '').charAt(0).toUpperCase()}
							</Avatar>
							<span style={{ color: '#ffffff', marginLeft: 5, fontSize: 15 }}>{user?.display_name}</span>
						</div>
					</Dropdown>
				</Header>
				<Layout>
					<Sider
						width={200}
						collapsible
						defaultCollapsed
						style={{ background: colorBgContainer, ...siderStyle }}
					>
						<Menu
							mode="inline"
							style={{ height: '100%', borderRight: 0 }}
							selectedKeys={selectedKeys}
							onClick={ev => {
								setselectedKeys([ev.key]);
								navigate(ev.key);
							}}
							items={[]}
						/>
					</Sider>
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
