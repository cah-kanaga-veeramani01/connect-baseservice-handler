import { Request, Response, NextFunction } from 'express';
import httpContext from 'express-http-context';
import { HandleError, logger, invoke, HTTP_STATUS_CODES } from '../../utils';

const authUrl = `${process.env.AUTH_URL}${process.env.AUTH_ROUTE}`;

/**
 * Authentication middleware - sets httpContext with userId and userRoles for authenticated user
 * @async
 * @param {Request} req - express request object
 * @param {Response} _res - express response object
 * @param {NextFunction} next - next middleware to be called
 */
export const auth = async (req: Request, _res: Response, next: NextFunction) => {
	try {
		const authRes = await invoke({
			method: 'GET',
			url: authUrl,
			headers: { cookie: `CFID=${req.cookies.CFID};CFTOKEN=${req.cookies.CFTOKEN};AWSALBCORS=${req.cookies.AWSALBCORS};AWSALB=${req.cookies.AWSALB}` }
		});
		if (authRes.status === HTTP_STATUS_CODES.ok) {
			httpContext.set('userId', authRes.data.userId);
			httpContext.set('userRoles', authRes.data.userRoles);
			next();
		} else {
			throw new HandleError({ name: 'AuthenticationError', errorStatus: HTTP_STATUS_CODES.unauthenticated, message: 'Error while authenticating', stack: 'Error while authenticating' });
		}
	} catch (error) {
		logger.nonPhi.error(error.message, { _err: error });
		if (error instanceof HandleError) next(error);
		else next(new HandleError({ name: 'AuthenticationError', errorStatus: HTTP_STATUS_CODES.unauthenticated, message: 'Error while authenticating', stack: 'Error while authenticating' }));
	}
};
