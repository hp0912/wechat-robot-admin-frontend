import { LogoutOutlined } from '@ant-design/icons';
import { Avatar, Dropdown, Layout, Menu, theme } from 'antd';
import type { MenuProps } from 'antd';
import React, { useContext, useEffect, useState } from 'react';
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
	const navigate = useNavigate();

	const { user, signOut } = useContext(UserContext);

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

	return (
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
							{(user?.username || '').charAt(0).toUpperCase()}
						</Avatar>
						<span style={{ color: '#ffffff', marginLeft: 5, fontSize: 15 }}>{user?.username}</span>
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
				<Layout style={{ padding: '10px 10px 0 10px' }}>
					<Outlet />
				</Layout>
			</Layout>
		</Layout>
	);
};

export default AppLayout;
