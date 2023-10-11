import { Request, Response, NextFunction } from 'express';
import { logger } from '../../utils';
import ESAPI from 'node-esapi';

/**
 * Middleware to log the time taken by each api call
 * @param {Request} req - request object received.
 * @param {Request} res - response object sent from the apis
 * @param {NextFunction} next - Next function calls goes to respective controllers
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
	try {
		logger.info(ESAPI.encoder().encodeForHTML(`${req.method}`), ESAPI.encoder().encodeForURL(`${req.originalUrl}`));

		const start = new Date().getTime();
		res.on('finish', () => {
			const elapsed = new Date().getTime() - start;
			logger.info(ESAPI.encoder().encodeForHTML(`${req.method}`), ESAPI.encoder().encodeForURL(`${req.originalUrl}`), ESAPI.encoder().encodeForHTML(`${res.statusCode}`), `${elapsed}ms`);
		});

		next();
	} catch (error) {
		next(error);
	}
};
