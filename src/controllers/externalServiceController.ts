import { NextFunction, Request, Response } from 'express';
import { logger } from '../../utils';
import { HTTP_STATUS_CODES } from '../../utils/constants';
import config from 'config';
import SNSServiceManager from '../managers/SNSServiceManager';
import ExternalServiceManager from '../managers/externalServiceManager';

/**
 * config based Constants
 * @constant
 */
const defaultSortBy: string = config.get('service.serviceList.sortBy'),
	defaultSortOrder: string = config.get('service.serviceList.sortOrder'),
	defaultFrom: number = config.get('service.serviceList.from'),
	defaultLimit: number = config.get('service.serviceList.limit');

export default class ExternalServiceController {
	constructor(public externalServiceManager: ExternalServiceManager, public snsServiceManager: SNSServiceManager) {}

	public async addModuleConfig(req: Request, res: Response, next: NextFunction) {
		try {
			const { moduleVersion } = req.body,
				{ serviceID, moduleID }: any = req.params;
			logger.debug('Update modules with module version invoked with following parameter', { moduleVersion, moduleID, serviceID });
			await this.externalServiceManager.addModuleConfig(serviceID, moduleVersion, moduleID);
			res.status(HTTP_STATUS_CODES.ok).json({ moduleID, moduleVersion, message: config.get('service.updateModules.success.message') });
		} catch (error: any) {
			logger.error(error.message, { _err: error });
			next(error);
		}
	}

	public async getServiceAttributesDetails(req: Request, res: Response, next: NextFunction) {
		try {
			const serviceID = req.query?.serviceID ? Number(req.query?.serviceID) : null,
				legacyTIPDetailID = req.query?.legacyTIPDetailID ? Number(req.query?.legacyTIPDetailID) : null,
				globalServiceVersion = req.query?.globalServiceVersion ? Number(req.query?.globalServiceVersion) : null,
				sortBy = req.query.sortBy ? String(req.query.sortBy) : defaultSortBy,
				sortOrder = req.query.sortOrder ? String(req.query.sortOrder) : defaultSortOrder,
				offset = req.query.from ? Number(req.query.from) : defaultFrom,
				limit = req.query.limit ? Number(req.query.limit) : defaultLimit;
			logger.debug('get service attributes deatils api invoked with following parameter', { serviceID, legacyTIPDetailID, globalServiceVersion, sortBy, sortOrder, offset, limit });
			res.send(await this.externalServiceManager.getServiceAttributesDetails(serviceID, legacyTIPDetailID, globalServiceVersion, sortBy, sortOrder, offset, limit));
		} catch (error) {
			logger.error(error.message, { _err: error });
			next(error);
		}
	}

	public async getServiceDetails(req: Request, res: Response, next: NextFunction) {
		try {
			const serviceID = Number(req.query?.serviceID),
				legacyTIPDetailID = Number(req.query?.legacyTIPDetailID);
			logger.debug('get seriveDeatils api invoked with following parameter', { serviceID, legacyTIPDetailID });
			res.send(await this.externalServiceManager.getServiceDetails(serviceID, legacyTIPDetailID));
		} catch (error: any) {
			logger.error(error.message, { _err: error });
			next(error);
		}
	}

	/**
	 * API to fetch all active and scheduled services.
	 * @function getAllActiveAndScheduledServices
	 * @async
	 * @param {Request} req - request body contains requestingApplication  as query params
	 * @param {Response} res - response object
	 * 			 1. All the active and scheduled services will be fetched from service schema.
	 * @param {NextFunction} next - use to call the next middleware, error handler in this case
	 */
	public async getAllActiveAndScheduledServices(req: Request, res: Response, next: NextFunction) {
		try {
			const requestingApplication = req.query?.requestingApplication;
			logger.info('getAllActiveAndScheduledServices API called with following parameters ', { requestingApplication });
			const snsMessages = await this.externalServiceManager.getAllActiveAndScheduledServices();
			res.json(snsMessages);
		} catch (error: any) {
			logger.error(error.message, { _err: error });
			next(error);
		}
	}
}
