import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import { HandleError, logger } from '../../utils';
import { HTTP_STATUS_CODES, DEFAULT_ERROR_CODE } from '../../utils/constants';

/**
 * Middleware for Error handling.
 * @param {HandleError} err Error passed from the application.
 * @param {Request} req Express request object.
 * @param {Response} res Express response object.
 * @param {NextFunction} next Express next function.
 * - This middleware handles errors throughout the application by passing error to next() function.
 * @example
 * ``` Typescript
 * try{
 * 	//Your code ar middleware or controller
 *}catch(error){
 * 	//Calling the error handler middleware
 *  	next(error)
 *}
 * ```
 * @returns {object} JSON error object.
 */
export const errorHandler: ErrorRequestHandler = (err: HandleError, _req: Request, res: Response, _next: NextFunction): object => {
	logger.error(err.message, { _error: err });
	return res.status(err.status || HTTP_STATUS_CODES.internalServerError).json({ name: err.name, code: err.code || DEFAULT_ERROR_CODE, message: err.message });
};
