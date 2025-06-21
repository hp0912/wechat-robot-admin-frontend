import type { FormInstance } from 'antd';
import type { AnyType } from '@/common/types';

export const onTTSEnabledChange = (form: FormInstance<AnyType>, checked: boolean) => {
	if (checked) {
		if (!form.getFieldValue('tts_settings')) {
			form.setFieldsValue({
				tts_settings: JSON.stringify(
					{
						access_token: '',
						app: {
							appid: '',
							cluster: 'volcano_tts',
							token: '',
						},
						audio: {
							compression_rate: 1,
							emotion: 'radio',
							encoding: 'mp3',
							language: 'cn',
							pitch_ratio: 1,
							rate: 24000,
							speed_ratio: 1,
							voice_type: 'BV412_streaming',
							volume_ratio: 1,
						},
						base_url: 'https://openspeech.bytedance.com/api/v1/tts',
						request: {
							frontend_type: 'unitTson',
							operation: 'query',
							pure_english_opt: '1',
							silence_duration: '125',
							text_type: 'plain',
							with_frontend: '1',
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
						access_token: '',
						appid: '',
						base_url: 'https://openspeech.bytedance.com/api/v1/tts_async/submit',
						callback_url: '',
						enable_subtitle: 0,
						format: 'mp3',
						language: '',
						pitch: 1,
						sample_rate: 24000,
						sentence_interval: 0,
						speed: 1,
						style: '',
						voice: '',
						voice_type: 'BV406_V2_streaming',
						volume: 1,
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
