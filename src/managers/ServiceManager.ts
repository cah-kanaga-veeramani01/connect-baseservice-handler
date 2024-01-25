import { Repository } from 'sequelize-typescript';
import { Service } from '../../database/models/Service';
import { serviceList, EMPTY_STRING, CLIENT_TZ } from '../../utils/constants';
import {
	QServiceList,
	QServiceDetails,
	QAddModuleConfig,
	QCheckConfigCount,
	QUpdateModuleConfig,
	QMissingModules,
	QServiceActiveOrInActive,
	QServiceActiveVersion,
	QExpiredServiceList,
	QgetActiveServices,
	QAttributesDefinition,
	QGetAllServiceIDsCountWithFilter,
	QGetAllServiceIDsCount,
	QGetAllServicesFromServiceIDWithInactive,
	QGetAllServiceIDsWithInactive,
	QGetAllServicesFromServiceIDWithInactiveFilter,
	QGetAllServiceIDsWithInactiveFilter,
	QGetAllServicesFromServiceID,
	QGetAllServiceIDs,
	QGetAllServicesFromServiceIDWithFilter,
	QGetAllServiceIDsWithFilter,
	QGetAllServiceIDsCountInactiveWithFilter,
	QGetAllServiceIDsCountWithInactive
} from '../../database/queries/service';
import { QueryTypes } from 'sequelize';
import { HandleError, HTTP_STATUS_CODES, logger } from '../../utils';
import { IService, ServiceListResponse } from '../interfaces/IServices';
import db from '../../database/DBManager';
import httpContext from 'express-http-context';
import { ServiceType } from '../../database/models/ServiceType';
import { ServiceModuleConfig } from '../../database/models/ServiceModuleConfig';
import { endDateWithClientTZ, startDateWithClientTZ, utcToClientTZ } from '../../utils/tzFormatter';
import moment from 'moment';

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
			logger.debug('Created a New Service Successfully.');
			const serviceResponse = service.toJSON();

			return { ...serviceResponse };
		} catch (error) {
			if (error instanceof HandleError) throw error;
			throw new HandleError({ name: 'CreateServiceError', message: error.message, stack: error.stack, errorStatus: error.statusCode });
		}
	}

	public async getServiceList(sortBy: string, sortOrder: string, offset: number, limit: number, keyword: string, showInactive: number): Promise<ServiceListResponse> {
		try {
			let totalServices = [];
			let services = [];
			let nonFilteredServices = [];
			const searchKey = keyword !== EMPTY_STRING ? serviceList.matchAll + keyword.trim() + serviceList.matchAll : serviceList.matchAll;
			if (showInactive === 1) {
				// query to get total count of services filtered by status & search key
				totalServices = await db.query(QExpiredServiceList(sortBy ?? serviceList.defaultSortBy, sortOrder), {
					type: QueryTypes.SELECT,
					replacements: { searchKey, limit: null, offset: null }
				});
				//query to fetch all services matching all criteria
				services = await db.query(QExpiredServiceList(sortBy ?? serviceList.defaultSortBy, sortOrder), {
					type: QueryTypes.SELECT,
					replacements: { searchKey, limit, offset }
				});
				//query to get total count of services with no filter
				nonFilteredServices = await db.query(QExpiredServiceList(sortBy ?? serviceList.defaultSortBy, sortOrder), {
					type: QueryTypes.SELECT,
					replacements: { searchKey: serviceList.matchAll, limit: null, offset: null }
				});
				await Promise.all([totalServices, services, nonFilteredServices]);
			} else {
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
				//query to get total count of services with no filter
				nonFilteredServices = await db.query(QServiceList(sortBy ?? serviceList.defaultSortBy, sortOrder), {
					type: QueryTypes.SELECT,
					replacements: { searchKey: serviceList.matchAll, limit: null, offset: null }
				});
				await Promise.all([totalServices, services, nonFilteredServices]);
			}

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

	/**
	 * Function to create a DraftVersion if draft version is not exists
	 * @function createDraft
	 * @async
	 * @param {number} serviceID - get details for particular serviceID
	 * @returns {Promise<object>} - service details
	 */
	public async createDraft(serviceID: number) {
		try {
			logger.debug('createDraft invoked with following parameters', { serviceID });

			const serviceDetails: any = await this.getDetails(serviceID);
			logger.debug('Service details', { serviceDetails });
			if (!serviceDetails) {
				throw new HandleError({ name: 'ServicDetailsNotFound', message: 'Service details not found', stack: 'Service details not found', errorStatus: HTTP_STATUS_CODES.badRequest });
			}

			if (serviceDetails.draftVersion) {
				return serviceDetails;
			} else if (serviceDetails.scheduledVersion) {
				const scheduledService: any = await this.serviceRepository.findOne({
					where: {
						serviceID: serviceDetails.serviceID,
						globalServiceVersion: serviceDetails.scheduledVersion
					},
					raw: true
				});

				if (!scheduledService) {
					throw new HandleError({ name: 'ServicVersionNotFound', message: 'Service version is incorrect', stack: 'Service version not found', errorStatus: HTTP_STATUS_CODES.badRequest });
				}
				await this.serviceRepository.update(
					{
						isPublished: 0,
						validFrom: null,
						validTill: null
					},
					{
						where: {
							serviceID: serviceDetails.serviceID,
							globalServiceVersion: serviceDetails.scheduledVersion
						}
					}
				);
				await this.serviceRepository.update(
					{
						validTill: null
					},
					{
						where: {
							serviceID: serviceDetails.serviceID,
							globalServiceVersion: serviceDetails.activeVersion
						}
					}
				);
				let draftService: any = await this.serviceRepository.findOne({
					where: {
						serviceID: serviceDetails.serviceID,
						globalServiceVersion: serviceDetails.scheduledVersion
					},
					raw: true
				});
				draftService = { ...draftService, draftServiceName: draftService.serviceName };
				delete draftService.serviceName;
				return {
					...draftService,
					activeVersion: serviceDetails.activeVersion,
					activeServiceName: serviceDetails.activeServiceName,
					scheduledVersion: null,
					draftVersion: draftService.globalServiceVersion,
					activeStartDate: serviceDetails.activeStartDate,
					scheduledStartDate: serviceDetails.scheduledStartDate,
					serviceType: serviceDetails.serviceType
				};
			}
			const activeService: any = await this.serviceRepository.findOne({
				where: {
					serviceID: serviceDetails.serviceID,
					globalServiceVersion: serviceDetails.activeVersion
				},
				raw: true
			});

			if (!activeService) {
				throw new HandleError({ name: 'ServicVersionNotFound', message: 'Service version is incorrect', stack: 'Service version not found', errorStatus: HTTP_STATUS_CODES.badRequest });
			}
			activeService.isPublished = 0;
			activeService.validFrom = null;
			activeService.validTill = null;
			activeService.globalServiceVersion += 1;

			const newDraftVersion: any = await this.serviceRepository.create(activeService);
			const draftServiceName = newDraftVersion.serviceName;
			return {
				...newDraftVersion.dataValues,
				activeVersion: serviceDetails.activeVersion,
				activeServiceName: serviceDetails.activeServiceName,
				scheduledVersion: null,
				draftVersion: newDraftVersion.globalServiceVersion,
				draftServiceName,
				activeStartDate: serviceDetails.activeStartDate,
				scheduledStartDate: serviceDetails.scheduledStartDate,
				serviceType: serviceDetails.serviceType
			};
		} catch (error: any) {
			logger.error(error.message, { _err: error });
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
			logger.debug('AddModuleConfig API invoked with following parameters', { serviceID, moduleVersion, modules });
			const params: any = { serviceID: serviceID };
			if ((await this.serviceRepository.count({ where: params })) === 0) {
				throw new HandleError({ name: 'ServiceDoesntExist', message: 'Service does not exist', stack: 'Service does not exist', errorStatus: HTTP_STATUS_CODES.notFound });
			}
			if (moduleVersion) params.globalServiceVersion = moduleVersion;

			if ((await this.serviceRepository.count({ where: params })) === 0) {
				throw new HandleError({
					name: 'ServiceModuleVersionDoesNotExist',
					message: 'service Module Version does not exist',
					stack: 'service Module Version does not exist',
					errorStatus: HTTP_STATUS_CODES.notFound
				});
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
			logger.error(error.message, { _err: error });
			if (error instanceof HandleError) throw error;
			throw new HandleError({ name: 'ServiceModuleUpdateError', message: error.message, stack: error.stack, errorStatus: HTTP_STATUS_CODES.internalServerError });
		}
	}
	async getMissingModules(serviceID: number, globalServiceVersion: number) {
		try {
			logger.debug('GetModuleEntry API invoked with following parameters', { serviceID, globalServiceVersion });
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
			logger.error(error.message, { _err: error });
			if (error instanceof HandleError) throw error;
			throw new HandleError({ name: 'ModuleConfigFetchError', message: error.message, stack: error.stack, errorStatus: HTTP_STATUS_CODES.internalServerError });
		}
	}

	/**
	 * Function to schedule Service
	 * @function put
	 * @async
	 * @param {number} serviceID - schedule for particular serviceID
	 * @param {number} globalServiceVersion - schedule for particular serviceVersion
	 * @returns {Promise<object>} - Service schedule details
	 */
	async schedule(serviceID: number, globalServiceVersion: number, startDate: string, endDate: string | null): Promise<object> {
		try {
			const today: any = moment.tz(moment(), CLIENT_TZ).format('YYYY-MM-DD');
			if (startDate <= today) {
				throw new HandleError({
					name: 'InvalidStartDate',
					message: 'Invalid start date provided',
					stack: 'Invalid start date provided',
					errorStatus: HTTP_STATUS_CODES.badRequest
				});
			}

			if (endDate && endDate < startDate) {
				throw new HandleError({
					name: 'InvalidEndDate',
					message: 'Invalid end date provided',
					stack: 'Invalid end date provided',
					errorStatus: HTTP_STATUS_CODES.badRequest
				});
			}

			const service = await this.serviceRepository.findOne({
				attributes: ['serviceID', 'globalServiceVersion', 'serviceName', 'validFrom', 'validTill', 'isPublished'],
				where: {
					serviceID,
					globalServiceVersion
				},
				raw: true
			});
			if (!service) throw new HandleError({ name: 'ServiceDoesntExist', message: 'Service does not exist', stack: 'Service does not exist', errorStatus: HTTP_STATUS_CODES.notFound });

			const existingStartDate = utcToClientTZ(service.validFrom),
				existingEndDate = utcToClientTZ(service.validTill),
				currentDate = moment.tz(moment(), CLIENT_TZ);

			if (service.isPublished && existingStartDate && existingStartDate <= currentDate && ((existingEndDate && existingEndDate >= currentDate) || existingEndDate === null)) {
				throw new HandleError({ name: 'ServiceIsActive', message: 'Service cannot be scheduled', stack: 'Service cannot be scheduled', errorStatus: HTTP_STATUS_CODES.badRequest });
			}

			if (service.isPublished && existingEndDate && existingEndDate < currentDate) {
				throw new HandleError({ name: 'ServiceIsExpired', message: 'Service cannot be scheduled', stack: 'Service cannot be scheduled', errorStatus: HTTP_STATUS_CODES.badRequest });
			}

			const validTill = endDate ? endDateWithClientTZ(endDate) : null;
			const result: any = await db.query(QServiceActiveVersion, {
				replacements: { serviceID: serviceID },
				type: QueryTypes.SELECT,
				raw: true
			});

			if (globalServiceVersion > 1 && result.length > 0 && result[0].globalServiceVersion < globalServiceVersion) {
				const activeVersion = result[0].globalServiceVersion;
				const computedEndDate = moment(startDate).subtract(1, 'days').format('YYYY-MM-DD');
				await this.serviceRepository.update({ validTill: endDateWithClientTZ(computedEndDate) }, { where: { serviceID, globalServiceVersion: activeVersion } });
			}

			const updatedProgram = await this.serviceRepository.update(
				{ validFrom: startDateWithClientTZ(startDate), validTill: validTill, isPublished: 1 },
				{ where: { serviceID, globalServiceVersion }, returning: true }
			);
			return updatedProgram[1][0];
		} catch (error: any) {
			logger.error(error.message, { _err: error });
			if (error instanceof HandleError) throw error;
			throw new HandleError({ name: 'ServiceScheduleError', message: error.message, stack: error.stack, errorStatus: HTTP_STATUS_CODES.internalServerError });
		}
	}

	/**
	 * Function to get the service details
	 * @function get
	 * @async
	 * @param {number} serviceID - get details for particular serviceID
	 * @returns {Promise<object>} - service details
	 */
	async getDetails(serviceID: number): Promise<object> {
		try {
			const service = await this.serviceRepository.findOne({
				attributes: ['serviceID', 'serviceDisplayName', 'serviceTypeID', 'legacyTIPDetailID'],
				where: {
					serviceID
				},
				raw: true,
				include: [
					{
						model: this.serviceTypeRepository,
						attributes: ['serviceType']
					}
				]
			});
			if (!service) throw new HandleError({ name: 'ServiceDoesntExist', message: 'Service does not exist', stack: 'Service does not exist', errorStatus: HTTP_STATUS_CODES.notFound });

			const serviceDetails = await db.query(QServiceDetails, {
				replacements: { serviceID: serviceID },
				type: QueryTypes.SELECT
			});

			const result = { ...serviceDetails[0], ...service, serviceType: service['serviceType.serviceType'] };

			delete result['serviceType.serviceType'];
			return result;
		} catch (error: any) {
			logger.error(error.message, { _err: error });
			if (error instanceof HandleError) throw error;
			throw new HandleError({ name: 'ServiceDetailFetchError', message: error.message, stack: error.stack, errorStatus: HTTP_STATUS_CODES.internalServerError });
		}
	}

	async getActiveService(serviceID: number): Promise<object> {
		let activeService: any;
		const serviceActiveVersion = await db.query(QServiceActiveVersion, {
			replacements: { serviceID: serviceID },
			type: QueryTypes.SELECT
		});
		if (serviceActiveVersion !== null) {
			activeService = await this.serviceRepository.findOne({
				where: {
					serviceID,
					globalServiceVersion: serviceActiveVersion[0].globalServiceVersion
				},
				raw: true
			});
		}
		return activeService;
	}
	async getActiveServices() {
		try {
			const data = await db.query(QgetActiveServices, {
				type: QueryTypes.SELECT,
				raw: true
			});
			const mappedObject = data.reduce((result, item) => {
				const { serviceID, categoryName, name } = item;

				if (!result[serviceID]) {
					result[serviceID] = {
						serviceID,
						legacyTIPDetailID: item.legacyTIPDetailID,
						globalServiceVersion: item.globalServiceVersion,
						validFrom: item.validFrom,
						validTill: item.validTill,
						status: item.status,
						serviceType: item.serviceType,
						attributes: {}
					};
				}

				if (categoryName !== null && name !== null) {
					if (!result[serviceID].attributes[categoryName]) {
						result[serviceID].attributes[categoryName] = [];
					}

					result[serviceID].attributes[categoryName].push(name);
				}
				return result;
			}, {});
			return Object.values(mappedObject);
		} catch (error: any) {
			logger.error(error.message, { _err: error });
			throw new HandleError({ name: 'ServiceDetailFetchError', message: error.message, stack: error.stack, errorStatus: HTTP_STATUS_CODES.internalServerError });
		}
	}
	public async getAllServicesList(sortBy: string, sortOrder: string, offset: number, limit: number, searchKey: string): Promise<{}> {
		try {
			let services = [];
			if (searchKey !== EMPTY_STRING) {
				logger.info('Fetching all services with search filter');
				services = await this.getAllServicesWithSearchFilter(sortBy, sortOrder, offset, limit, searchKey);
			} else {
				logger.info('Fetching all services without any search filter');
				services = await this.getAllServicesWithoutFilter(sortBy, sortOrder, offset, limit);
			}
			const attributesDefinition = await this.getAttributesDefinition(),
				servicesMap = new Map<number, object>();

			services.forEach((service) => {
				let attributesForListRow = [],
					serviceAttributeArr = [];
				if (service.metadata != null) {
					service['metadata'] = JSON.parse(service.metadata);
					serviceAttributeArr = Object.values(service.metadata['attributes']).map((attributeID: any) => attributeID);
					attributesForListRow = this.getServiceAttributesDefinition(attributesDefinition, serviceAttributeArr);
				}
				if (servicesMap.has(service.serviceid)) {
					let existingService = { ...service };
					existingService['attributes'] = this.getServiceAttributesDefinition(attributesDefinition, serviceAttributeArr);

					const _service = JSON.parse(JSON.stringify(servicesMap.get(service.serviceid)));
					_service.statuses.push(this.getServiceDetails(existingService));
					if (service.status === 'ACTIVE' || service.status === 'INACTIVE') {
						_service.servicename = service.servicename;
						_service.attributes = attributesForListRow;
					}

					this.removeVersionSpecificDetailsFromService(service);
					servicesMap.set(_service.serviceid, _service);
				} else {
					let existingService = { ...service };
					existingService['attributes'] = this.getServiceAttributesDefinition(attributesDefinition, serviceAttributeArr);
					service.statuses = [this.getServiceDetails(existingService)];
					this.removeVersionSpecificDetailsFromService(existingService);
					if (service.status === 'ACTIVE' || service.status === 'INACTIVE') {
						service['attributes'] = attributesForListRow;
					}
					servicesMap.set(service.serviceid, service);
				}
			});

			const count = await this.getTotalServices();
			let filtedCount = count;
			if (searchKey !== EMPTY_STRING) {
				filtedCount = await this.getTotalServicesFiltered(searchKey);
			}
			const response = {
				totalServices: filtedCount,
				nonFilteredServicesCount: count,
				services: [...servicesMap.values()]
			};
			logger.info('Returning the list of all services.');
			return response;
		} catch (error) {
			logger.error('Error while fetching all the services', error);
			throw new HandleError({ name: 'ServiceListFetchError', message: error.message, stack: error.stack, errorStatus: error.statusCode });
		}
	}

	public async getNonInActiveServicesList(sortBy: string, sortOrder: string, offset: number, limit: number, searchKey: string): Promise<{}> {
		try {
			let services = [];
			if (searchKey !== EMPTY_STRING) {
				logger.info('Fetching all the non inactive services with search filter');
				services = await this.getNonInActiveServicesWithSearchFilter(sortBy, sortOrder, offset, limit, searchKey);
			} else {
				logger.info('Fetching all the non inactive services without search filter');
				services = await this.getAllNonInActiveServicesWithoutFilter(sortBy, sortOrder, offset, limit);
			}

			const attributesDefinition = await this.getAttributesDefinition(),
				servicesMap = new Map<number, object>();

			services.forEach((service) => {
				let attributesForListRow = [];
				let serviceAttributeArr = [];
				if (service.metadata != null) {
					let serviceAttributeArr = Object.values(service.metadata['attributes']).map((attributeID: any) => attributeID);
					attributesForListRow = this.getServiceAttributesDefinition(attributesDefinition, serviceAttributeArr);
				}
				if (servicesMap.has(service.serviceid)) {
					let existingService = { ...service };
					existingService['attributes'] = this.getServiceAttributesDefinition(attributesDefinition, serviceAttributeArr);
					const _service = JSON.parse(JSON.stringify(servicesMap.get(service.serviceid)));
					_service.statuses.push(this.getServiceDetails(existingService));
					if (service.status === 'ACTIVE') {
						_service.servicename = service.servicename;
						_service.attributes = attributesForListRow;
					}
					this.removeVersionSpecificDetailsFromService(service);
					servicesMap.set(_service.serviceid, _service);
				} else {
					let existingService = { ...service };
					existingService['attributes'] = this.getServiceAttributesDefinition(attributesDefinition, serviceAttributeArr);
					service.statuses = [this.getServiceDetails(existingService)];
					this.removeVersionSpecificDetailsFromService(existingService);
					if (service.status === 'ACTIVE') {
						service['attributes'] = attributesForListRow;
					}
					servicesMap.set(service.serviceid, service);
				}
			});
			const count = await this.getTotalNonInActiveServices();
			let filtedCount = count;
			if (searchKey !== EMPTY_STRING) {
				filtedCount = await this.getTotalNonInActiveServicesFiltered(searchKey);
			}
			const response = {
				totalServices: filtedCount,
				nonFilteredServicesCount: count,
				services: [...servicesMap.values()]
			};
			logger.info('Returning all the non inactive services.');
			return response;
		} catch (error) {
			logger.error('Error while fetching all the non inactive services', error);
			throw new HandleError({ name: 'NonInActiveServicesListFetchError', message: error.message, stack: error.stack, errorStatus: error.statusCode });
		}
	}

	private async getTotalServices(): Promise<number> {
		logger.info('Returning the count of all services including inactive services.');
		let data = await db.query(QGetAllServiceIDsCountWithInactive(), {
			type: QueryTypes.SELECT,
			replacements: {}
		});
		return Number(data[0].count);

		//
		// return this.serviceRepository.count({ distinct: true, col: 'serviceID' });
	}
	private async getTotalServicesFiltered(searchKey): Promise<number> {
		logger.info('Returning the count of total number of non inactive services.');
		let data = await db.query(QGetAllServiceIDsCountInactiveWithFilter(), {
			type: QueryTypes.SELECT,
			replacements: { searchKey }
		});
		console.log('ww', data);
		return Number(data[0].count);
	}

	private async getNonInActiveServicesWithSearchFilter(sortBy: string, sortOrder: string, offset: number, limit: number, searchKey: string): Promise<[]> {
		let sortByAppendedQuots = '"serviceName"';
		if (sortBy === 'serviceName') {
			sortByAppendedQuots = '"servicename"';
		} else if (sortBy === 'serviceID') {
			sortByAppendedQuots = '"serviceID"';
		}
		const ids = await db.query(QGetAllServiceIDsWithFilter(sortByAppendedQuots, sortOrder), {
			type: QueryTypes.SELECT,
			replacements: { limit, offset, searchKey }
		});
		const idsArr = Object.values(ids).map((obj: any) => obj.serviceID);
		if (idsArr.length == 0) return [];
		return await db.query(QGetAllServicesFromServiceIDWithFilter(sortByAppendedQuots, sortOrder, idsArr.join(',')), {
			type: QueryTypes.SELECT,
			replacements: { limit, offset, searchKey }
		});
	}

	private async getAllNonInActiveServicesWithoutFilter(sortBy: string, sortOrder: string, offset: number, limit: number): Promise<[]> {
		let sortByAppendedQuots = '"serviceName"';
		if (sortBy === 'serviceName') {
			sortByAppendedQuots = '"serviceName"';
		} else if (sortBy === 'serviceID') {
			sortByAppendedQuots = '"serviceid"';
		}
		const ids = await db.query(QGetAllServiceIDs(sortByAppendedQuots, sortOrder), {
			type: QueryTypes.SELECT,
			replacements: { limit, offset }
		});
		const idsArr = Object.values(ids).map((obj: any) => obj.serviceid);
		if (idsArr.length == 0) {
			return [];
		}
		return await db.query(QGetAllServicesFromServiceID(sortByAppendedQuots, sortOrder, idsArr.join(',')), {
			type: QueryTypes.SELECT,
			replacements: { limit, offset }
		});
	}

	private async getAllServicesWithSearchFilter(sortBy: string, sortOrder: string, offset: number, limit: number, searchKey: string): Promise<[]> {
		let sortByAppendedQuots = '"servicename"';
		if (sortBy === 'serviceName') {
			sortByAppendedQuots = '"servicename"';
		} else if (sortBy === 'serviceID') {
			sortByAppendedQuots = '"serviceID"';
		}
		const ids = await db.query(QGetAllServiceIDsWithInactiveFilter(sortByAppendedQuots, sortOrder), {
				type: QueryTypes.SELECT,
				replacements: { limit, offset, searchKey }
			}),
			idsArr = Object.values(ids).map((obj: any) => obj.serviceid);
		if (idsArr.length == 0) return [];
		return await db.query(QGetAllServicesFromServiceIDWithInactiveFilter(sortByAppendedQuots, sortOrder, idsArr.join(',')), {
			type: QueryTypes.SELECT,
			replacements: { limit, offset }
		});
	}

	private async getAllServicesWithoutFilter(sortBy: string, sortOrder: string, offset: number, limit: number): Promise<[]> {
		let sortByAppendedQuots = '"servicename"',
			sortByNumber = 2;
		if (sortBy === 'servicename') {
			sortByAppendedQuots = '"servicename"';
			sortByNumber = 2;
		} else if (sortBy === 'serviceID') {
			sortByAppendedQuots = '"serviceid"';
			sortByNumber = 1;
		}
		const ids = await db.query(QGetAllServiceIDsWithInactive(sortByNumber, sortOrder), {
				type: QueryTypes.SELECT,
				replacements: { limit, offset }
			}),
			idsArr = Object.values(ids).map((obj: any) => obj.serviceid);
		if (idsArr.length == 0) return [];
		return await db.query(QGetAllServicesFromServiceIDWithInactive(sortByAppendedQuots, sortOrder, idsArr.join(',')), {
			type: QueryTypes.SELECT,
			replacements: { limit, offset }
		});
	}

	private getServiceDetails(service) {
		return {
			status: service.status,
			validFrom: service.validFrom,
			validTill: service.validTill,
			isPublished: service.isPublished,
			serviceName: service.servicename,
			serviceType: service.servicetype,
			legacyTIPDetailID: service.legacytipdetailid,
			globalServiceVersion: service.globalServiceVersion,
			attributes: service.attributes
		};
	}

	private removeVersionSpecificDetailsFromService(service) {
		delete service.validFrom;
		delete service.validTill;
		delete service.isPublished;
		delete service.globalServiceVersion;
	}

	private async getTotalNonInActiveServices(): Promise<number> {
		logger.info('Returning the count of total number of non inactive services.');
		let data = await db.query(QGetAllServiceIDsCount(), {
			type: QueryTypes.SELECT,
			replacements: {}
		});
		return Number(data[0].count);
	}
	private async getTotalNonInActiveServicesFiltered(searchKey): Promise<number> {
		logger.info('Returning the count of total number of non inactive services.');
		let data = await db.query(QGetAllServiceIDsCountWithFilter(), {
			type: QueryTypes.SELECT,
			replacements: { searchKey }
		});
		return Number(data[0].count);
	}
	private async getAttributesDefinition(): Promise<Object> {
		return await db.query(QAttributesDefinition(), {
			type: QueryTypes.SELECT,
			replacements: {}
		});
	}

	private getServiceAttributesDefinition(attributesDefinition, ids) {
		let arr = [];
		attributesDefinition.forEach((obj) => {
			if (ids.includes(obj.attributesDefinitionID)) {
				arr.push(obj.name);
			}
		});
		return arr;
	}

}
