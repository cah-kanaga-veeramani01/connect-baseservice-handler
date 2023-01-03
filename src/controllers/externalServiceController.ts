import { Request, Response } from 'express';
import { logger } from '../../utils';
import externalServiceManager from '../managers/externalServiceManager';
import { HTTP_STATUS_CODES } from '../../utils/constants';
import config from 'config';

export default class externalServiceController {
	constructor(public externalServiceManager: externalServiceManager) {}

	public async addModuleConfig(req: Request, res: Response) {
		try {
			const { moduleVersion } = req.body,
				{ modules } = req.body,
				{ serviceID }: any = req.params;
			logger.nonPhi.debug('Update modules with module version invoked with following parameter', { moduleVersion, modules, serviceID });
			await this.externalServiceManager.addModuleConfig(serviceID, moduleVersion, modules);
			res.status(HTTP_STATUS_CODES.ok).json({ modules, moduleVersion, message: config.get('service.updateModules.success.message') });
		} catch (error: any) {
			logger.nonPhi.error(error.message, { _err: error });
			res.json(error.message);
		}
	}
}
