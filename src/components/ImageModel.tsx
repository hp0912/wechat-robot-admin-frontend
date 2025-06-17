import { AutoComplete, Form } from 'antd';
import React from 'react';
import type { AnyType } from '@/common/types';

interface IProps {
	placeholder?: string;
	value?: string;
	onChange?: (value: string) => void;
}

const ImageModel = (props: IProps) => {
	const form = Form.useFormInstance<{ image_ai_settings: string }>();

	return (
		<AutoComplete
			placeholder={props.placeholder}
			value={props.value}
			onChange={props.onChange}
			style={{ width: '100%' }}
			options={[
				{ label: '智谱', value: 'glm' },
				{ label: '豆包', value: 'doubao' },
				{ label: '即梦', value: 'jimeng' },
				{ label: '腾讯混元', value: 'hunyuan', disabled: true },
			]}
			onSelect={(value: string) => {
				if (value === 'doubao') {
					form.setFieldsValue({
						image_ai_settings: JSON.stringify(
							{
								api_key: '',
								model: 'doubao-seedream-3-0-t2i-250415',
								response_format: 'url',
								size: '1024x1024',
								seed: -1,
								guidance_scale: 2.5,
								watermark: false,
							},
							null,
							2,
						) as AnyType,
					});
				}
				if (value === 'glm') {
					form.setFieldsValue({
						image_ai_settings: JSON.stringify(
							{
								api_key: '',
								model: 'cogview-4-250304',
								quality: 'hd',
								size: '1024x1024',
							},
							null,
							2,
						) as AnyType,
					});
				}
				if (value === 'jimeng') {
					form.setFieldsValue({
						image_ai_settings: JSON.stringify(
							{
								sessionid: [''],
								model: 'jimeng-3.0',
								width: 1024,
								height: 1024,
								sample_strength: 0.5,
							},
							null,
							2,
						) as AnyType,
					});
				}
				if (value === 'hunyuan') {
					form.setFieldsValue({
						image_ai_settings: JSON.stringify(
							{
								SecretId: '',
								SecretKey: '',
								ChatId: null,
								LogoAdd: 1,
								LogoParam: {
									LogoUrl: 'https://aoaoaowu-1256901433.cos.ap-guangzhou.myqcloud.com/images/ai-logo.jpg',
									LogoImage: null,
									LogoRect: {
										X: 10,
										Y: 10,
										Width: 20,
										Height: 20,
									},
								},
							},
							null,
							2,
						) as AnyType,
					});
				}
			}}
		/>
	);
};

export default React.memo(ImageModel);
