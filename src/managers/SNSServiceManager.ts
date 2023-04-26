import { HTTP_STATUS_CODES } from '../../utils';
import { HandleError } from '../../utils/HandleError';
import { logger } from '../../utils/logger';

const axios = require('axios');

export default class SNSServiceManager {
	async parentPublishScheduleMessageToSNSTopic(serviceID: number, globalServiceVersion: number, startDate: string, endDate: string, headers: any) {
		const data = JSON.stringify({
				message: {
					type: 'MODULE-SCHEDULE-EVENT',
					result: {
						globalServiceVersion,
						serviceID,
						isPublished: 1,
						startDate,
						endDate
					}
				},
				topic: process.env.SNS_TOPIC
			}),
			config = {
				method: 'post',
				url: process.env.PUBLISH_URL,
				headers: {
					'Content-Type': 'application/json',
					Cookie: headers.cookie,
					'X-XSRF-TOKEN': headers['x-xsrf-token']
				},
				data
			};
		const response = await axios.post(config.url, config.data, { headers: config.headers }).catch((error) => {
			logger.nonPhi.error(error.message, { _err: error });
			if (error instanceof HandleError) throw error;
			else throw new HandleError({ name: 'ParentPublishToSNSTopicError', message: error.message, stack: error.stack, errorStatus: HTTP_STATUS_CODES.internalServerError });
		});
		return response.data;
	}
}
