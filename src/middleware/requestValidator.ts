import ajv from 'ajv';
import { HandleError } from '../../utils';
import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS_CODES } from '../../utils/constants';

/**
 * ajv validator object
 */
const ajvObj = new ajv({ allErrors: true });

/**
 * Middleware to validate every request based on the schema and req sub-object name passed to it.
 * @param {object} validationSchema - schema to validate against
 */
export function validateRequest(validationSchema: object) {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			const validity = ajvObj.validate(validationSchema, req);
			if (validity) {
				next();
			} else {
				next(
					new HandleError({
						name: 'Request Validation Failed',
						message: ajvObj.errorsText(),
						stack: ajvObj.errorsText(),
						errorStatus: HTTP_STATUS_CODES.badRequest
					})
				);
			}
		} catch (error) {
			next(new HandleError({ name: 'Request Validation Failed', message: error.message, stack: error.stack, errorStatus: HTTP_STATUS_CODES.badRequest }));
		}
	};
}
