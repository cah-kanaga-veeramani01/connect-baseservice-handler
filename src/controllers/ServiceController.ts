import { NextFunction, Request, Response } from 'express';
import { logger } from '../../utils';
import { IService } from '../interfaces/IServices';
import ServiceManager from '../managers/ServiceManager';

export default class ServiceController {
	constructor(public serviceManager: ServiceManager) {}

	public async createService(req: Request, res: Response, next: NextFunction) {
		try {
			const servicePayload: IService = req.body;
			logger.nonPhi.info('ADD Service has been invoked with following parameters ', servicePayload.serviceTypeID);
			res.send(await this.serviceManager.createService(servicePayload));
		} catch (error) {
			next(error);
		}
	}
}
