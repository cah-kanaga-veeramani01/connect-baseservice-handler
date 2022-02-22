import { NextFunction, Request, Response } from 'express';
import { logger } from '../../utils';
import { IServiceTag } from '../interfaces/IServices';
import ServiceTagManager from '../managers/ServiceTagManager';

export default class ServiceTagController {
	constructor(public serviceTagManager: ServiceTagManager) {}

	public async createServiceTags(req: Request, res: Response, next: NextFunction) {
		try {
			const serviceTagPayload: IServiceTag = req.body;
			logger.nonPhi.info('ADD Service Tag API has been invoked with following parameters ', { ...serviceTagPayload });
			res.send(await this.serviceTagManager.createServiceTags(serviceTagPayload));
		} catch (error) {
			next(error);
		}
	}

	public async getAllServiceTags(req: Request, res: Response, next: NextFunction) {
		try {
			logger.nonPhi.info('GET Service Tags has been invoked ');
			res.send(await this.serviceTagManager.getAllServiceTags());
		} catch (error) {
			next(error);
		}
	}
}
