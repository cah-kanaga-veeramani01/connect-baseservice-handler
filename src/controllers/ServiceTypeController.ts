import { NextFunction, Request, Response } from 'express';
import { logger } from '../../utils';
import { IServiceType } from '../interfaces/IServices';
import ServiceTypeManager from '../services/ServiceTypeManager';

export default class ServiceTypeController {
	constructor(public serviceTypeManager: ServiceTypeManager) {}

	public async getAllServiceTypes(req: Request, res: Response, next: NextFunction) {
		try {
			logger.nonPhi.info('GET Service Types has been invoked');
			res.send(await this.serviceTypeManager.getAllServiceTypes());
		} catch (error) {
			next(error);
		}
	}

	public async createServiceType(req: Request, res: Response, next: NextFunction) {
		try {
			const serviceTypePayload: IServiceType = req.body;
			logger.nonPhi.info('ADD Service Type has been invoked with following parameter ', { ...req.body });
			res.send(await this.serviceTypeManager.createServiceType(serviceTypePayload));
		} catch (error) {
			next(error);
		}
	}
}
