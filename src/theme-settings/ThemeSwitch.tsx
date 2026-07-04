import { BgColorsOutlined } from '@ant-design/icons';
import { useBoolean } from 'ahooks';
import { Button, Tooltip } from 'antd';
import React from 'react';
import { HeaderTheme } from './styled';
import ThemeSettings from './ThemeSettings';

interface IProps {
	className?: string;
	style?: React.CSSProperties;
}

const ThemeSwitch = (props: IProps) => {
	const { className = '', style = {} } = props;

	const [open, { setFalse, setTrue }] = useBoolean(false);

	return (
		<HeaderTheme
			className={className}
			style={style}
		>
			<Tooltip title="主题设置">
				<Button
					className="theme-settings-button"
					type="text"
					shape="circle"
					icon={<BgColorsOutlined />}
					aria-label="打开主题设置"
					onClick={setTrue}
				/>
			</Tooltip>
			{open && (
				<ThemeSettings
					open={open}
					onClose={setFalse}
				/>
			)}
		</HeaderTheme>
	);
};

export default React.memo(ThemeSwitch);
