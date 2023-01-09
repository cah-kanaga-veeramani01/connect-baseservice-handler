import { HTTP_STATUS_CODES } from '../../utils';
import { HandleError } from '../../utils/HandleError';
import { logger } from '../../utils/logger';

const axios = require('axios');

export default class SNSServiceManager {
	/**
	 * Function to invoke API to publish message to SNS Topic.
	 * @function publishToSNSTopic
	 * @asyn
	 * @param {programId}  - Program Identifier
	 * @param {globalProgramVersion} globalProgramVersion - latest version of the program
	 *@param {headers} headers - request headers
	 **/

	async publishToSNSTopic(programId: number, globalProgramVersion: number, headers: any) {
		const data = JSON.stringify({
				message: {
					type: 'MODULE-SAVE-SUCCESS-EVENT',
					result: {
						moduleID: 1,
						moduleVersion: globalProgramVersion,
						programId: programId
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

		await axios(config)
			.then((response) => {
				return response.data;
			})
			.catch((error) => {
				logger.nonPhi.error(error.message, { _err: error });
				if (error instanceof HandleError) throw error;
				else throw new HandleError({ name: 'PublishToSNSTopicError', message: error.message, stack: error.stack, errorStatus: HTTP_STATUS_CODES.internalServerError });
			});
	}

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
