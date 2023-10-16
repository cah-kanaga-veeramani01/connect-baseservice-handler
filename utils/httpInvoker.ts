import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { logger } from './logger';
/**
 *
 * @param {AxiosRequestConfig} reqConfig - Configuration required for api calls.
 *  * @example
 * ``` Typescript
 * invoke({
	method: 'POST',
	url: 'http://example.com/api',
	headers: { 'content-type': 'application/json' },
	data: { body: 'request body' }
});
 * ```
 * @returns {Promise<AxiosResponse<any>>}
 */
export const invoke = async (reqConfig: AxiosRequestConfig): Promise<AxiosResponse<any>> => {
	try {
		return await axios(reqConfig);
	} catch (error: any) {
		logger.error(error.message, { _err: error });
		throw error;
	}
};
