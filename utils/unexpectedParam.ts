import { logger } from './logger';

export const validateRequest = (originalUrl) => {
	try {
		const queryString = decodeURIComponent(originalUrl), //Replace %27 to ' and %22 to " in query string
			seperatorIndex = queryString.indexOf('?'),
			stringLength = queryString.length,
			queryParams = queryString.slice(seperatorIndex, stringLength),
			//Doing it this way prevents matching '?&abc=def' or '?abc=def&=123' etc.
			queryRegex = new RegExp(/^\?([\w-]+(=[\w-'"]*)?(&[\w-]+(=[\w-'".!@_$%^&*()+{}#|;:<>?\/, ~`]*)?)*)?$/i),
			result = queryRegex.test(queryParams);
		return result;
	} catch (error) {
		logger.nonPhi.error('UnExpected Params Error', { stack: error });
	}
};
export const validateFileName = (fileName: string, pattern: string) => {
	try {
		const queryRegex = new RegExp(pattern);
		return queryRegex.test(fileName);
	} catch (error) {
		logger.nonPhi.error('UnExpected Params Error', { stack: error });
	}
};
export const validateList = (originalUrl: string) => {
	try {
		const queryString = decodeURIComponent(originalUrl),
			queryRegex = new RegExp(/(\/policy\/internal\/list){1}/),
			result = queryRegex.test(queryString);
		return result;
	} catch (error) {
		logger.nonPhi.error('UnExpected Params Error', { stack: error });
	}
};

// export const validatePBP = (pbp: string) => {
// 	try {
// 		const queryRegex = new RegExp('^[a-zA-Z0-9.!@_$%^&*()+{}#|;:<>?/,\'\'"" ~`]{3,}$');
// 		return queryRegex.test(pbp);
// 	} catch (error) {
// 		logger.nonPhi.error('UnExpected Params Error', error);
// 	}
// };
