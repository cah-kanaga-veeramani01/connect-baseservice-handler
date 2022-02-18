import { NextFunction, Request, Response } from 'express';
import { logger } from '../../utils';
import { IService } from '../interfaces/IServices';
import ServiceManager from '../managers/ServiceManager';
import { serviceList, EMPTY_STRING } from '../../utils/constants';

export default class ServiceController {
	constructor(public serviceManager: ServiceManager) {}

	public async createService(req: Request, res: Response, next: NextFunction) {
		try {
			const servicePayload: IService = req.body;
			logger.nonPhi.info('ADD Service has been invoked with following parameters ', { ...servicePayload });
			res.send(await this.serviceManager.createService(servicePayload));
		} catch (error) {
			next(error);
		}
	}

	public async getServiceList(req: Request, res: Response, next: NextFunction) {
		try {
			const sortBy = req.query.sortBy ? String(req.query.sortBy) : serviceList.defaultSortBy,
				sortOrder = req.query.sortOrder ? String(req.query.sortOrder) : serviceList.defaultSortOrder,
				from = req.query.from ? Number(req.query.from) : serviceList.defaultFrom,
				limit = req.query.limit ? Number(req.query.limit) : serviceList.defaultLimit,
				keyword = req.query.keyword ? String(req.query.keyword) : EMPTY_STRING,
				statusFilter = req.query.statusFilter ? String(req.query.statusFilter) : serviceList.defaultFilterBy;

			res.send(await this.serviceManager.getServiceList(sortBy, sortOrder, from, limit, keyword, statusFilter));
		} catch (error) {
			next(error);
		}
	}
}
