import type { FormInstance } from 'antd';
import type { AnyType } from '@/common/types';

export const onTTSEnabledChange = (form: FormInstance<AnyType>, checked: boolean) => {
	if (checked) {
		if (!form.getFieldValue('tts_settings')) {
			form.setFieldsValue({
				tts_settings: JSON.stringify(
					{
						base_url: 'https://openspeech.bytedance.com/api/v1/tts',
						access_token: '',
						app: {
							appid: '',
							cluster: 'volcano_tts',
						},
						audio: {
							voice_type: 'BV412_streaming',
							emotion: 'radio',
						},
					},
					null,
					2,
				) as unknown as object,
			});
		}
		if (!form.getFieldValue('ltts_settings')) {
			form.setFieldsValue({
				ltts_settings: JSON.stringify(
					{
						base_url: 'https://openspeech.bytedance.com/api/v1/tts_async/submit',
						appid: '',
						access_token: '',
						voice_type: 'BV104_streaming',
						callback_url: '',
					},
					null,
					2,
				) as unknown as object,
			});
		}
	}
};

export const ObjectToString = <T extends { image_ai_settings: object; tts_settings: object; ltts_settings: object }>(
	data: T,
) => {
	if (data.image_ai_settings && typeof data.image_ai_settings === 'object') {
		data.image_ai_settings = JSON.stringify(data.image_ai_settings, null, 2) as unknown as object;
	}
	if (data.tts_settings && typeof data.tts_settings === 'object') {
		data.tts_settings = JSON.stringify(data.tts_settings, null, 2) as unknown as object;
	}
	if (data.ltts_settings && typeof data.ltts_settings === 'object') {
		data.ltts_settings = JSON.stringify(data.ltts_settings, null, 2) as unknown as object;
	}
};
