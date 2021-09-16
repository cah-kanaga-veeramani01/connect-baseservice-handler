import { NextFunction, Request, Response } from 'express';
import { logger } from '../../utils';
import { IServiceClass } from '../interfaces/IServices';
import ServiceClassManager from '../managers/ServiceClassManager';

export default class ServiceClassController {
	constructor(public serviceClassManager: ServiceClassManager) {}

	public async createServiceClasses(req: Request, res: Response, next: NextFunction) {
		try {
			const serviceClassPayload: IServiceClass = req.body;
			logger.nonPhi.info('ADD Service Class has been invoked with following parameters ', { ...serviceClassPayload });
			res.send(await this.serviceClassManager.createServiceClasses(serviceClassPayload));
		} catch (error) {
			next(error);
		}
	}

	public async getAllServiceClasses(req: Request, res: Response, next: NextFunction) {
		try {
			const serviceTypeID = Number(req.query?.serviceTypeID);
			logger.nonPhi.info('GET Service Classes has been invoked with following parameter ', { serviceTypeID });
			res.send(await this.serviceClassManager.getAllServiceClasses(serviceTypeID));
		} catch (error) {
			next(error);
		}
	}
}
