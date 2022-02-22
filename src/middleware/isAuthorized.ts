import { NextFunction, Request, Response } from 'express';
import httpContext from 'express-http-context';
import { HandleError, HTTP_STATUS_CODES } from '../../utils';
import defineAbilityFor, { Subject, UserAction } from '../models/defineAbility';

/**
 * Middleware to check the user access on resources
 * @param {UserAction} action - Action of user eg., create, read, update & delete
 * @param {Subject} resource - resouces to be accessed by the user eg., Program, Policy
 */
export function isAuthorized(action: UserAction, resource: Subject) {
	return (_req: Request, _res: Response, next: NextFunction) => {
		try {
			const userRoles: string[] = httpContext.get('userRoles');
			if (userRoles.length) {
				const ability = defineAbilityFor(userRoles);
				if (ability.can(action, resource)) {
					next();
				} else {
					throw new HandleError({ name: 'Unauthorised', errorStatus: HTTP_STATUS_CODES.unauthorized, message: 'Access Denied', stack: 'User Doesn’t have access to this resource' });
				}
			} else {
				throw new HandleError({ name: 'Unauthorised', errorStatus: HTTP_STATUS_CODES.unauthorized, message: 'Access Denied', stack: 'User Doesn’t have access to this resource' });
			}
		} catch (error) {
			if (error instanceof HandleError) next(error);
			else next(new HandleError({ name: 'InternalServerError', errorStatus: HTTP_STATUS_CODES.unauthorized, message: 'Error while Authorising', stack: 'Error while Authorising' }));
		}
	};
}
