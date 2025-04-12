import '@ant-design/v5-patch-for-react-19';
import { App as AntdApp, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import ReactDOM from 'react-dom/client';
import { COLOR_THEME } from '@/constant/color';
import App from './App';
import './index.less';

dayjs.locale('zh-cn');
const root = document.getElementById('root')!;

ReactDOM.createRoot(root).render(
	<ConfigProvider
		locale={zhCN}
		theme={{ token: { colorPrimary: COLOR_THEME } }}
	>
		<AntdApp>
			<div className="skin" />
			<App />
		</AntdApp>
	</ConfigProvider>,
);
