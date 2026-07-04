import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.less';
import { ThemeSettingsProvider } from './theme-settings';

dayjs.locale('zh-cn');
const root = document.getElementById('root')!;

const bootEl = document.getElementById('boot-root');
if (bootEl) {
	bootEl.remove();
}

ReactDOM.createRoot(root).render(
	<ThemeSettingsProvider>
		<App />
	</ThemeSettingsProvider>,
);
