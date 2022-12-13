import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
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
export const invoke = (reqConfig: AxiosRequestConfig): Promise<AxiosResponse<any>> => {
	try {
		return axios(reqConfig);
	} catch (error) {
		throw error;
	}
};
