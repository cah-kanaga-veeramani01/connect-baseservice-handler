import { Request, Response, NextFunction } from 'express';
import httpContext from 'express-http-context';
import config from 'config';
import { HandleError } from '../../utils';
import locale from 'locale';

/**
 * Middleware for adding http context.
 * (This middleware should be used with 'express-http-context' and before any middlewares that set a context)
 * @param {Request} req - set context from express request object
 * @param {Response} _res - express response object
 * @param {NextFunction} next - next middleware to be called
 */
export const contextStore = (req: Request, _res: Response, next: NextFunction): void => {
	try {
		// set all the context here Eg. lang, jwt, users, session attributes
		var supported = new locale.Locales(config.get('supportedLanguages'), config.get('language'));
		httpContext.set('language', new locale.Locales(req.headers['accept-language']).best(supported).toString());
		next();
	} catch (error) {
		next(new HandleError(error));
	}
};
