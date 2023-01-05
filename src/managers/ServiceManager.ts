import { Repository } from 'sequelize-typescript';
import { Service } from '../../database/models/Service';
import { serviceList, EMPTY_STRING } from '../../utils/constants';
import { QServiceList, QServiceDetails, QAddModuleConfig, QCheckConfigCount, QUpdateModuleConfig, QMissingModules, QServiceActiveOrInActive } from '../../database/queries/service';
import { QueryTypes } from 'sequelize';
import { HandleError, HTTP_STATUS_CODES, logger } from '../../utils';
import { IService, ServiceListResponse } from '../interfaces/IServices';
import db from '../../database/DBManager';
import httpContext from 'express-http-context';
import { ServiceType } from '../../database/models/ServiceType';
import { ServiceModuleConfig } from '../../database/models/ServiceModuleConfig';

export default class ServiceManager {
	constructor(public serviceRepository: Repository<Service>, public serviceTypeRepository: Repository<ServiceType>, public ServiceModuleConfigRepository: Repository<ServiceModuleConfig>) {}

	public async createService(servicePayload: IService) {
		try {
			const serviceAlreadyExists = await this.serviceRepository.findOne({ where: { serviceName: servicePayload.serviceName } });
			if (serviceAlreadyExists) {
				throw new HandleError({
					name: 'ServiceAlreadyExistsError',
					message: 'Service already present in the system',
					stack: 'Service already exists in the system',
					errorStatus: HTTP_STATUS_CODES.badRequest
				});
			}
			const serviceType = await this.serviceTypeRepository.findOne({ where: { serviceTypeID: servicePayload.serviceTypeID } });
			if (!serviceType) {
				throw new HandleError({
					name: 'ServiceTypeNotFoundError',
					message: 'Service Type does not exists in the system',
					stack: 'Service Type not found in the system',
					errorStatus: HTTP_STATUS_CODES.notFound
				});
			}

			const service = await this.serviceRepository.create({
				serviceName: servicePayload.serviceName,
				serviceDisplayName: servicePayload.serviceDisplayName,
				serviceTypeID: servicePayload.serviceTypeID,
				globalServiceVersion: 1,
				validFrom: new Date(),
				isPublished: 1,
				createdBy: httpContext.get('userId')
			});
			logger.nonPhi.debug('Created a New Service Successfully.');
			const serviceResponse = service.toJSON();

			return { ...serviceResponse };
		} catch (error) {
			if (error instanceof HandleError) throw error;
			throw new HandleError({ name: 'CreateServiceError', message: error.message, stack: error.stack, errorStatus: error.statusCode });
		}
	}

	public async getServiceList(sortBy: string, sortOrder: string, offset: number, limit: number, keyword: string): Promise<ServiceListResponse> {
		try {
			let totalServices = [];
			let services = [];
			let nonFilteredServices = [];
			// let status = statusFilter.toLowerCase() === serviceList.defaultFilterBy.toLowerCase() ? serviceList.matchAll : statusFilter;
			const searchKey = keyword !== EMPTY_STRING ? serviceList.matchAll + keyword.trim() + serviceList.matchAll : serviceList.matchAll;
			// query to get total count of services filtered by status & search key
			totalServices = await db.query(QServiceList(sortBy ?? serviceList.defaultSortBy, sortOrder), {
				type: QueryTypes.SELECT,
				replacements: { searchKey, limit: null, offset: null }
			});

			//query to fetch all services matching all criteria
			services = await db.query(QServiceList(sortBy ?? serviceList.defaultSortBy, sortOrder), {
				type: QueryTypes.SELECT,
				replacements: { searchKey, limit, offset }
			});

			// // query to get total count of services with no filter
			// // status = serviceList.matchAll;
			// // searchKey = serviceList.matchAll;
			nonFilteredServices = await db.query(QServiceList(sortBy ?? serviceList.defaultSortBy, sortOrder), {
				type: QueryTypes.SELECT,
				replacements: { searchKey: serviceList.matchAll, limit: null, offset: null }
			});

			await Promise.all([totalServices, services, nonFilteredServices]);

			const response: ServiceListResponse = {
				totalServices: totalServices.length,
				nonFilteredServicesCount: nonFilteredServices.length,
				services: services
			};
			return response;
		} catch (error) {
			throw new HandleError({ name: 'ServiceListFetchError', message: error.message, stack: error.stack, errorStatus: error.statusCode });
		}
	}

	public async createDraft(serviceID: number) {
		try {
			logger.nonPhi.debug('Draft API invoked with following parameters', { serviceID });

			const service = await this.serviceRepository.findOne({
				attributes: ['serviceID', 'serviceName', 'serviceDisplayName', 'serviceTypeID', 'legacyTIPDetailID'],
				where: {
					serviceID
				},
				raw: true
			});
			if (!service) throw new HandleError({ name: 'ServiceDoesntExist', message: 'Service does not exist', stack: 'Service does not exist', errorStatus: HTTP_STATUS_CODES.notFound });

			const serviceDetails = await db.query(QServiceDetails, {
				replacements: { serviceID: serviceID },
				type: QueryTypes.SELECT
			});

			const result = { ...serviceDetails[0], ...service };

			if (result.draftVersion || result.scheduledVersion) {
				return result;
			}

			const selectedService = await this.serviceRepository.findOne({
				where: {
					serviceID: result.serviceID,
					globalServiceVersion: result.activeVersion
				},
				raw: true
			});

			selectedService.isPublished = 0;
			selectedService.validFrom = null;
			selectedService.validTill = null;
			selectedService.globalServiceVersion += 1;

			const newDraftVersion: any = await this.serviceRepository.create(selectedService);

			return { ...newDraftVersion.dataValues, scheduledVersion: null, draftVersion: newDraftVersion.globalServiceVersion };
		} catch (error: any) {
			logger.nonPhi.error(error.message, { _err: error });
			if (error instanceof HandleError) throw error;
			throw new HandleError({ name: 'ServiceDraftFetchError', message: error.message, stack: error.stack, errorStatus: HTTP_STATUS_CODES.internalServerError });
		}
	}

	/**
	 * Function to update moduleID and version of the service
	 * @function post
	 * @async
	 * @param {number} serviceID -  serviceID of for the service moduleConfig
	 * @param {number} modules -  modules that containing the moduleID in the serviceModuleConfig
	 * @param {number} moduleVersion - moduleVersion is same as globalServiceVersion of the service
	 */
	async addModuleConfig(serviceID: number, moduleVersion: number, modules: number) {
		try {
			logger.nonPhi.debug('AddModuleConfig API invoked with following parameters', { serviceID, moduleVersion, modules });
			const serviceDetails: any = await this.serviceRepository.findOne({ where: { serviceID, globalServiceVersion: moduleVersion } });
			if (!serviceDetails) {
				throw new HandleError({ name: 'ServiceDoesntExist', message: 'Service does not exist', stack: 'Service does not exist', errorStatus: HTTP_STATUS_CODES.notFound });
			}
			const configCount = await db.query(QCheckConfigCount, {
				replacements: { serviceID: serviceID, moduleID: modules },
				type: QueryTypes.SELECT
			});
			if (Number(configCount[0].count) > 0) {
				await db.query(QUpdateModuleConfig, {
					replacements: { serviceID, moduleID: modules, moduleVersion },
					type: QueryTypes.UPDATE,
					raw: true
				});
			} else {
				await db.query(QAddModuleConfig, {
					replacements: { serviceID, moduleID: modules, moduleVersion },
					type: QueryTypes.INSERT,
					raw: true
				});
			}
		} catch (error: any) {
			logger.nonPhi.error(error.message, { _err: error });
			if (error instanceof HandleError) throw error;
			throw new HandleError({ name: 'ServiceModuleUpdateError', message: error.message, stack: error.stack, errorStatus: HTTP_STATUS_CODES.internalServerError });
		}
	}

	async getMissingModules(serviceID: number, globalServiceVersion: number) {
		try {
			logger.nonPhi.debug('GetModuleEntry API invoked with following parameters', { serviceID, globalServiceVersion });
			const serviceDetails: any = await this.serviceRepository.findOne({ where: { serviceID, globalServiceVersion } });
			if (!serviceDetails) {
				throw new HandleError({ name: 'ServiceDoesntExist', message: 'Service does not exist', stack: 'Service does not exist', errorStatus: HTTP_STATUS_CODES.notFound });
			}
			let missingModules;

			const activeOrInActiveService = await db.query(QServiceActiveOrInActive, {
				replacements: { serviceID: serviceID },
				type: QueryTypes.SELECT,
				raw: true
			});
			if (activeOrInActiveService.length > 0) {
				missingModules = [];
			} else {
				missingModules = await db.query(QMissingModules, {
					replacements: { serviceID: serviceID, globalServiceVersion: globalServiceVersion },
					type: QueryTypes.SELECT,
					raw: true
				});
			}
			return { serviceID, globalServiceVersion, missingModules };
		} catch (error: any) {
			logger.nonPhi.error(error.message, { _err: error });
			if (error instanceof HandleError) throw error;
			throw new HandleError({ name: 'ModuleConfigFetchError', message: error.message, stack: error.stack, errorStatus: HTTP_STATUS_CODES.internalServerError });
		}
	}
}
