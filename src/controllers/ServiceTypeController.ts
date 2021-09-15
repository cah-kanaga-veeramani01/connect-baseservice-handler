import { NextFunction, Request, Response } from 'express';
import { logger } from '../../utils';
import { IService, IServiceClass, IServiceType } from '../interfaces/IServices';
import ServiceManager from '../services/ServiceManager';

export default class ServiceTypeController {
	constructor(public serviceManager: ServiceManager) {}

	public async createServiceClass(req: Request, res: Response, next: NextFunction) {
		try {
			const serviceClassPayload: IServiceClass = req.body;
			logger.nonPhi.info('ADD Service Class has been invoked with following parameters ', { ...req.body.serviceTypeID, ...req.body.serviceClassNames });
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

	public async createServiceType(req: Request, res: Response, next: NextFunction) {
		try {
			const serviceTypePayload: IServiceType = req.body;
			logger.nonPhi.info('ADD Service Type has been invoked with following parameter ', { ...req.body });
			res.send(await this.serviceManager.createServiceType(serviceTypePayload));
		} catch (error) {
			next(error);
		}
	}

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
