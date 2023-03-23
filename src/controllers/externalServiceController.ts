import { Request, Response } from 'express';
import { logger } from '../../utils';
import { HTTP_STATUS_CODES } from '../../utils/constants';
import config from 'config';

export default class ExternalServiceController {
	constructor(public ExternalServiceManager) {}

	public async addModuleConfig(req: Request, res: Response) {
		try {
			const { moduleVersion } = req.body,
				{ serviceID, moduleID }: any = req.params;
			logger.nonPhi.debug('Update modules with module version invoked with following parameter', { moduleVersion, moduleID, serviceID });
			await this.ExternalServiceManager.addModuleConfig(serviceID, moduleVersion, moduleID);
			res.status(HTTP_STATUS_CODES.ok).json({ moduleID, moduleVersion, message: config.get('service.updateModules.success.message') });
		} catch (error: any) {
			logger.nonPhi.error(error.message, { _err: error });
			res.json(error.message);
		}
	}
}
