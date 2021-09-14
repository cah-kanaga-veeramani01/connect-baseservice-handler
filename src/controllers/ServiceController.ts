import { NextFunction, Request, Response } from 'express';
import { logger } from '../../utils';
import { IService, IServiceClass } from '../interfaces/IServices';
import ServiceManager from '../services/ServiceManager';

export default class ServiceClassController {
	constructor(public serviceManager: ServiceManager) {}

	public async createServiceClass(req: Request, res: Response, next: NextFunction) {
		try {
			const serviceClassPayload: IServiceClass = req.body;
			const serviceTypeID = serviceClassPayload.serviceTypeID,
				serviceClassNames = serviceClassPayload.serviceClassNames;
			logger.nonPhi.info('ADD Service Class has been invoked with following parameters ', { serviceTypeID, serviceClassNames });
			res.send(await this.serviceManager.createServiceClass(serviceClassPayload));
		} catch (error) {
			next(error);
		}
	}

	public async getAllServiceClasses(req: Request, res: Response, next: NextFunction) {
		try {
			const serviceTypeID = Number(req.query?.serviceTypeID);
			logger.nonPhi.info('GET Service Classes has been invoked with following parameter ', { serviceTypeID });
			res.send(await this.serviceManager.getAllServiceClasses(serviceTypeID));
		} catch (error) {
			next(error);
		}
	}

	public async getAllServiceTypes(req: Request, res: Response, next: NextFunction) {
		try {
			logger.nonPhi.info('GET Service Types has been invoked');
			res.send(await this.serviceManager.getAllServiceTypes());
		} catch (error) {
			next(error);
		}
	}

	public async createService(req: Request, res: Response, next: NextFunction) {
		try {
			const servicePayload: IService = req.body;
			const serviceTypeID = servicePayload.serviceTypeID;
			logger.nonPhi.info('ADD Service has been invoked with following parameters ', { serviceTypeID });
			res.send(await this.serviceManager.createService(servicePayload));
		} catch (error) {
			next(error);
		}
	}
}
