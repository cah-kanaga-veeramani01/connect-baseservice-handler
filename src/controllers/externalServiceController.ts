import { NextFunction, Request, Response } from 'express';
import { logger } from '../../utils';
import { HTTP_STATUS_CODES } from '../../utils/constants';
import config from 'config';

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
			const serviceID = Number(req.query?.serviceID),
				legacyTIPDetailID = Number(req.query?.legacyTIPDetailID);
			logger.nonPhi.debug('get serive attributes deatils api invoked with following parameter', { serviceID, legacyTIPDetailID });
			res.send(await this.ExternalServiceManager.getServiceAttributesDetails(serviceID, legacyTIPDetailID));
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
