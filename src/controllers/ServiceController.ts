import { NextFunction, Request, Response } from 'express';
import { HandleError, logger } from '../../utils';
import { IService } from '../interfaces/IServices';
import ServiceManager from '../managers/ServiceManager';
import { serviceList, EMPTY_STRING, HTTP_STATUS_CODES } from '../../utils/constants';
import config from 'config';

export default class ServiceController {
	constructor(public serviceManager: ServiceManager) {}

	public async createService(req: Request, res: Response) {
		try {
			const servicePayload: IService = req.body;
			logger.nonPhi.info('ADD Service has been invoked with following parameters ', { ...servicePayload });
			res.json(await this.serviceManager.createService(servicePayload));
		} catch (error) {
			res.json(error);
		}
	}

	public async getServiceList(req: Request, res: Response) {
		try {
			const sortBy = req.query.sortBy ? String(req.query.sortBy) : serviceList.defaultSortBy,
				sortOrder = req.query.sortOrder ? String(req.query.sortOrder) : serviceList.defaultSortOrder,
				from = req.query.from ? Number(req.query.from) : serviceList.defaultFrom,
				limit = req.query.limit ? Number(req.query.limit) : serviceList.defaultLimit,
				keyword = req.query.keyword ? String(req.query.keyword).replace(/_/g, '\\_') : EMPTY_STRING;
			// statusFilter = req.query.statusFilter ? String(req.query.statusFilter) : serviceList.defaultFilterBy;
			logger.nonPhi.debug('Service list invoked with following parameters', { sortBy, sortOrder, from, limit, keyword });
			res.send(await this.serviceManager.getServiceList(sortBy, sortOrder, from, limit, keyword));
		} catch (error) {
			throw new HandleError({ name: 'ServiceListFetchError', message: error.message, stack: error.stack, errorStatus: error.statusCode });
		}
	}

	public async createDraft(req: Request, res: Response) {
		try {
			const serviceID = req.body?.serviceID;
			logger.nonPhi.debug('Create draft invoked with following parameter', { serviceID });
			res.json(await this.serviceManager.createDraft(serviceID));
		} catch (error: any) {
			res.json(error);
		}
	}

	public async addModuleConfig(req: Request, res: Response) {
		try {
			const { moduleVersion } = req.body,
				{ modules } = req.body,
				{ serviceID }: any = req.params;
			logger.nonPhi.debug('Update modules with module version invoked with following parameter', { moduleVersion, modules, serviceID });
			await this.serviceManager.addModuleConfig(serviceID, moduleVersion, modules);
			res.status(HTTP_STATUS_CODES.ok).json({ modules, moduleVersion, message: config.get('service.updateModules.success.message') });
		} catch (error: any) {
			logger.nonPhi.error(error.message, { _err: error });
			res.json(error.message);
		}
	}

	public async getModuleEntries(req: Request, res: Response, next: NextFunction) {
		try {
			const serviceID = Number(req.query?.serviceID),
				globalServiceVersion = Number(req.query?.globalServiceVersion);
			logger.nonPhi.debug('Get serviceModule config invoked with following parameter', { serviceID, globalServiceVersion });
			const serviceModule = await this.serviceManager.getMissingModules(serviceID, globalServiceVersion);
			res.send(serviceModule);
		} catch (error: any) {
			logger.nonPhi.error(error.message, { _err: error });
			next(error);
		}
	}
}
