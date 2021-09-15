import { NextFunction, Request, Response } from 'express';
import { logger } from '../../utils';
import { IServiceClass } from '../interfaces/IServices';
import ServiceClassManager from '../services/ServiceClassManager';

export default class ServiceClassController {
	constructor(public serviceClassManager: ServiceClassManager) {}

	public async createServiceClass(req: Request, res: Response, next: NextFunction) {
		try {
			const serviceClassPayload: IServiceClass = req.body;
			logger.nonPhi.info('ADD Service Class has been invoked with following parameters ', { ...req.body.serviceTypeID, ...req.body.serviceClassNames });
			res.send(await this.serviceClassManager.createServiceClass(serviceClassPayload));
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
