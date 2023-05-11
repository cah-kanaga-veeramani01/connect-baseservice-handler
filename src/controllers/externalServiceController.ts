import { NextFunction, Request, Response } from 'express';
import { logger } from '../../utils';
import { HTTP_STATUS_CODES } from '../../utils/constants';
import config from 'config';

/**
 * config based Constants
 * @constant
 */
const defaultSortBy: string = config.get('service.serviceList.sortBy'),
	defaultSortOrder: string = config.get('service.serviceList.sortOrder'),
	defaultFrom: number = config.get('service.serviceList.from'),
	defaultLimit: number = config.get('service.serviceList.limit');

export default class ExternalServiceController {
	constructor(public ExternalServiceManager) {}

	public async addModuleConfig(req: Request, res: Response, next: NextFunction) {
		try {
			const { moduleVersion } = req.body,
				{ serviceID, moduleID }: any = req.params;
			logger.nonPhi.debug('Update modules with module version invoked with following parameter', { moduleVersion, moduleID, serviceID });
			await this.ExternalServiceManager.addModuleConfig(serviceID, moduleVersion, moduleID);
			res.status(HTTP_STATUS_CODES.ok).json({ moduleID, moduleVersion, message: config.get('service.updateModules.success.message') });
		} catch (error: any) {
			logger.nonPhi.error(error.message, { _err: error });
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
			logger.nonPhi.debug('get serive attributes deatils api invoked with following parameter', { serviceID, legacyTIPDetailID, globalServiceVersion, sortBy, sortOrder, offset, limit });
			res.send(await this.ExternalServiceManager.getServiceAttributesDetails(serviceID, legacyTIPDetailID, globalServiceVersion, sortBy, sortOrder, offset, limit));
		} catch (error) {
			logger.nonPhi.error(error.message, { _err: error });
			next(error);
		}
	}

	public async getServiceDetails(req: Request, res: Response, next: NextFunction) {
		try {
			const serviceID = Number(req.query?.serviceID),
				legacyTIPDetailID = Number(req.query?.legacyTIPDetailID);
			logger.nonPhi.debug('get seriveDeatils api invoked with following parameter', { serviceID, legacyTIPDetailID });
			res.send(await this.ExternalServiceManager.getServiceDetails(serviceID, legacyTIPDetailID));
		} catch (error: any) {
			logger.nonPhi.error(error.message, { _err: error });
			next(error);
		}
	}
}
