import { Request, Response, NextFunction } from 'express';
import { HEADERS, LOG_ID, LOG_PAYLOAD } from '../../utils/constants';
import { HandleError, logger } from '../../utils';
import { nanoid } from 'nanoid';
import httpContext from 'express-http-context';

/**
 * Method to generate logId to be used in all api calls and appends to the request/response headers and log Context
 * @param {Request} req HTTP Request argument to the middleware function
 * @param {Response} res HTTP Response argument to the middleware function
 * @param {NextFunction} next Callback argument to the middleware function
 */
export const generateLogId = (req: Request, res: Response, next: NextFunction) => {
	try {
		let logId = '';
		if (!req.headers[HEADERS.LOG_ID]) {
			logger.nonPhi.debug('LOG_ID generated with the length', { _logIdLength: LOG_ID.LENGTH });
			logId = nanoid(LOG_ID.LENGTH);
			httpContext.set('logID', logId);
			req.headers[HEADERS.LOG_ID] = logId;
		}

		LOG_PAYLOAD._logId = String(req.headers[HEADERS.LOG_ID]);
		res.setHeader(HEADERS.LOG_ID, LOG_PAYLOAD._logId);
		next();
	} catch (error) {
		next(new HandleError(error));
	}
};
