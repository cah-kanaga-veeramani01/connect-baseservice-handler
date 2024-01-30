import { NextFunction, Request, Response } from 'express';
import { HandleError, logger } from '../../utils';
import { IService } from '../interfaces/IServices';
import ServiceManager from '../managers/ServiceManager';
import { serviceList, EMPTY_STRING, HTTP_STATUS_CODES, SERVICE_SCHEDULE_EVENT, SERVICE_CHANGE_EVENT } from '../../utils/constants';
import config from 'config';
import SNSServiceManager from '../managers/SNSServiceManager';
import moment from 'moment';
import { endDateWithClientTZ, startDateWithClientTZ } from '../../utils/tzFormatter';

export default class ServiceController {
	constructor(public serviceManager: ServiceManager, public snsServiceManager: SNSServiceManager) {}

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
				keyword = req.query.keyword ? String(req.query.keyword).replace(/_/g, '\\_') : EMPTY_STRING,
				searchKey = keyword !== EMPTY_STRING ? serviceList.matchAll + keyword.trim() + serviceList.matchAll : EMPTY_STRING;
			const showInactive = req.query.showInactive ? Number(req.query.showInactive) : 0;
			logger.nonPhi.debug('Service list invoked with following parameters', { sortBy, sortOrder, from, limit, keyword, showInactive });
			if (Number(req.query.showInactive) === 1) {
				//Show inactive=true
				res.send(await this.serviceManager.getAllServicesList(sortBy, sortOrder, from, limit, searchKey));
			} else {
				//Show inactive=false
				res.send(await this.serviceManager.getNonInActiveServicesList(sortBy, sortOrder, from, limit, searchKey));
			}
		} catch (error) {
			logger.nonPhi.error('Error while fetching the services list', error);
			throw new HandleError({ name: 'ServiceListFetchError', message: error.message, stack: error.stack, errorStatus: error.statusCode });
		}
	}

	public async createDraft(req: Request, res: Response) {
		try {
			const serviceID = req.body?.serviceID;
			logger.nonPhi.debug('Create draft invoked with following parameter', { serviceID });
			const service = JSON.parse(JSON.stringify(await this.serviceManager.getDetails(serviceID)));
			const serviceDraftVersion = await this.serviceManager.createDraft(serviceID);
			res.json(serviceDraftVersion);
			if (service !== null && service.scheduledVersion) {
				this.snsServiceManager.parentPublishScheduleMessageToSNSTopic(
					serviceID,
					service.legacyTIPDetailID,
					serviceDraftVersion.globalServiceVersion,
					serviceDraftVersion.validFrom,
					serviceDraftVersion.validTill,
					serviceDraftVersion.isPublished,
					req.headers,
					'change'
				);

				if (service !== null && service.activeVersion) {
					const activeService = JSON.parse(JSON.stringify(await this.serviceManager.getActiveService(serviceID)));
					this.snsServiceManager.parentPublishScheduleMessageToSNSTopic(
						serviceID,
						service.legacyTIPDetailID,
						activeService.globalServiceVersion,
						activeService.validFrom,
						activeService.validTill,
						activeService.isPublished,
						req.headers,
						'change'
					);
				}
			}
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

	/**
	 * schedule service
	 * @function schedule
	 * @async
	 * @param {Request} req - request object need to contain serviceID, globalServiceVersion and startDate
	 * @param {Response} res - response object consists of scheduled service details
	 * @param {NextFunction} next - use to call the next middleware, error handler in this case
	 */
	public async schedule(req: Request, res: Response, next: NextFunction) {
		try {
			const { serviceID, globalServiceVersion, startDate, endDate } = req.body;
			logger.nonPhi.debug('Schedule service invoked with following parameter', { serviceID, globalServiceVersion, startDate, endDate });
			const scheduledService = JSON.parse(JSON.stringify(await this.serviceManager.schedule(serviceID, globalServiceVersion, startDate, endDate)));
			res.send(scheduledService);
			const validTill = endDate ? endDateWithClientTZ(endDate) : null;
			this.snsServiceManager.parentPublishScheduleMessageToSNSTopic(
				serviceID,
				scheduledService.legacyTIPDetailID,
				globalServiceVersion,
				startDateWithClientTZ(startDate),
				validTill,
				scheduledService.isPublished,
				req.headers,
				SERVICE_SCHEDULE_EVENT
			);
			const activeService = JSON.parse(JSON.stringify(await this.serviceManager.getActiveService(serviceID)));
			if (activeService !== null) {
				const endDate = activeService.validTill ? activeService.validTill : endDateWithClientTZ(moment(startDate).subtract(1, 'days').format('YYYY-MM-DD'));
				this.snsServiceManager.parentPublishScheduleMessageToSNSTopic(
					serviceID,
					scheduledService.legacyTIPDetailID,
					activeService.globalServiceVersion,
					activeService.validFrom,
					endDate,
					activeService.isPublished,
					req.headers,
					SERVICE_CHANGE_EVENT
				);
			}
		} catch (error: any) {
			logger.nonPhi.error(error.message, { _err: error });
			next(error);
		}
	}

	/**
	 * Get service details
	 * @function getDetails
	 * @async
	 * @param {Request} req - request object need to contain queryParam serviceID
	 * @param {Response} res - response object consists of service details that was requested
	 * @param {NextFunction} next - use to call the next middleware, error handler in this case
	 */
	public async getDetails(req: Request, res: Response, next: NextFunction) {
		try {
			const serviceID = Number(req.query.serviceID);
			logger.nonPhi.debug('Get service details invoked with following parameter', { serviceID });
			const serviceDetails = await this.serviceManager.getDetails(serviceID);
			res.send(serviceDetails);
		} catch (error: any) {
			next(error);
		}
	}
	public async getActiveServices(req: Request, res: Response, next: NextFunction) {
		try {
			logger.nonPhi.info('Geting service list');
			const serviceDetails = await this.serviceManager.getActiveServices();
			res.send(serviceDetails);
		} catch (error: any) {
			next(error);
		}
	}
}
