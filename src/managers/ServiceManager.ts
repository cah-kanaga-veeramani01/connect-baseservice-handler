import { Repository } from 'sequelize-typescript';
import { Service } from '../../database/models/Service';
import {
	EMPTY_STRING,
	CLIENT_TZ,
	SERVICE_CHANGE_EVENT,
	SERVICE_SCHEDULE_EVENT,
	ERROR_MSG_REMOVE_ATTRIBUTES,
	ERROR_MSG_ADD_ATTRIBUTES,
	DATE_FORMAT,
	SCHEDULED,
	DRAFT,
	ACTIVE,
	REQUEST_COMPLETED,
	REQUEST_FAILED,
	ERROR_MSG_NON_ASSOCIATED_ATTRIBUTES
} from '../../utils/constants';
import {
	QAddModuleConfig,
	QCheckConfigCount,
	QUpdateModuleConfig,
	QMissingModules,
	QServiceActiveOrInActive,
	QServiceActiveVersion,
	QgetActiveServices,
	QGetAllServiceIDs,
	QGetAllServicesFromServiceID,
	QGetAllServiceIDsCount,
	QAttributesDefinition,
	QGetAllServiceIDsWithFilter,
	QGetAllServicesFromServiceIDWithFilter,
	QGetAllServiceIDsCountWithFilter,
	QGetAllServiceIDsWithInactive,
	QGetAllServicesFromServiceIDWithInactive,
	QGetAllServiceIDsCountWithInactive,
	QGetAllServiceIDsWithInactiveFilter,
	QGetAllServicesFromServiceIDWithInactiveFilter,
	QGetAllServiceIDsCountInactiveWithFilter,
	QAllServicesByStatus,
	QGetAllAttributesDefinition
} from '../../database/queries/service';
import { QueryTypes, Sequelize, Op } from 'sequelize';
import { HandleError, HTTP_STATUS_CODES, logger } from '../../utils';
import { IService } from '../interfaces/IServices';
import db from '../../database/DBManager';
import httpContext from 'express-http-context';
import { ServiceType } from '../../database/models/ServiceType';
import { ServiceModuleConfig } from '../../database/models/ServiceModuleConfig';
import { endDateWithClientTZ, startDateWithClientTZ, utcToClientTZ } from '../../utils/tzFormatter';
import moment from 'moment';
import { BulkServiceAttributesStatus } from '../../database/models/BulkServiceAttributesStatus';
import XLSX from 'xlsx';
import { ServiceAttributes } from '../../database/models/ServiceAttributes';
import SNSServiceManager from './SNSServiceManager';
export default class ServiceManager {
	constructor(
		public serviceRepository: Repository<Service>,
		public serviceTypeRepository: Repository<ServiceType>,
		public ServiceModuleConfigRepository: Repository<ServiceModuleConfig>,
		public bulkServiceAttributesRepository: Repository<BulkServiceAttributesStatus>,
		public serviceAttributesRepository: Repository<ServiceAttributes>,
		public snsServiceManager: SNSServiceManager
	) {}

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

	/**
	 * Function to create a DraftVersion if draft version is not exists
	 * @function createDraft
	 * @async
	 * @param {number} serviceID - get details for particular serviceID
	 * @returns {Promise<object>} - service details
	 */
	public async createDraft(serviceID: number) {
		try {
			logger.nonPhi.debug('createDraft invoked with following parameters', { serviceID });

			const serviceDetails: any = await this.getDetails(serviceID);
			logger.nonPhi.debug('Service details', { serviceDetails });
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
					throw new HandleError({ name: 'ServiceVersionNotFound', message: 'Service version is incorrect', stack: 'Service version not found', errorStatus: HTTP_STATUS_CODES.badRequest });
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
				throw new HandleError({ name: 'ServiceVersionNotFound', message: 'Service version is incorrect', stack: 'Service version not found', errorStatus: HTTP_STATUS_CODES.badRequest });
			}

			activeService.globalServiceVersion += 1;

			const newDraftVersion: any = await this.serviceRepository.create({
				serviceID: activeService.serviceID,
				globalServiceVersion: activeService.globalServiceVersion,
				serviceName: activeService.serviceName,
				serviceDisplayName: activeService.serviceDisplayName,
				validFrom: null,
				validTill: null,
				isPublished: 0,
				serviceTypeID: activeService.serviceTypeID,
				legacyTIPDetailID: activeService.legacyTIPDetailID,
				serviceType: activeService.serviceType
			});

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
			const today: any = moment.tz(moment(), CLIENT_TZ).format(DATE_FORMAT);
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
				const computedEndDate = moment(startDate).subtract(1, 'days').format(DATE_FORMAT);
				await this.serviceRepository.update({ validTill: endDateWithClientTZ(computedEndDate) }, { where: { serviceID, globalServiceVersion: activeVersion } });
			}

			const updatedProgram = await this.serviceRepository.update(
				{ validFrom: startDateWithClientTZ(startDate), validTill: validTill, isPublished: 1 },
				{ where: { serviceID, globalServiceVersion }, returning: true }
			);
			return updatedProgram[1][0];
		} catch (error: any) {
			logger.nonPhi.error(error.message, { _err: error });
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
			interface detailObj {
				[key: string]: any;
			}

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

			const serviceDetails = await db.query(QAllServicesByStatus, {
				replacements: { serviceID: serviceID },
				type: QueryTypes.SELECT
			});
			var serviceInfo: detailObj = {};
			serviceInfo.inactiveServiceName = null;
			serviceInfo.inactiveVersion = null;

			serviceDetails.filter((service: any) => {
				if (service.status === 'ACTIVE') {
					serviceInfo.activeServiceName = service.serviceName;
					serviceInfo.activeVersion = service.globalServiceVersion;
					serviceInfo.activeStartDate = service.validFrom;
				}
				if (service.status === 'SCHEDULED') {
					serviceInfo.scheduledServiceName = service.serviceName;
					serviceInfo.scheduledVersion = service.globalServiceVersion;
					serviceInfo.scheduledStartDate = service.validFrom;
				}
				if (service.status === 'DRAFT') {
					serviceInfo.draftServiceName = service.serviceName;
					serviceInfo.draftVersion = service.globalServiceVersion;
				}
				if (service.status === 'INACTIVE' && serviceDetails.findIndex((service) => service.status === 'ACTIVE') === -1) {
					serviceInfo.inactiveServiceName = service.serviceName;
					serviceInfo.inactiveVersion = service.globalServiceVersion;
				}
			});

			const result = { ...serviceInfo, ...service, serviceType: service['serviceType.serviceType'] };

			delete result['serviceType.serviceType'];
			return result;
		} catch (error: any) {
			logger.nonPhi.error(error.message, { _err: error });
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
			logger.nonPhi.error(error.message, { _err: error });
			throw new HandleError({ name: 'ServiceDetailFetchError', message: error.message, stack: error.stack, errorStatus: HTTP_STATUS_CODES.internalServerError });
		}
	}
	public async getAllServicesList(sortBy: string, sortOrder: string, offset: number, limit: number, searchKey: string): Promise<{}> {
		try {
			let services = [];
			if (searchKey !== EMPTY_STRING) {
				logger.nonPhi.info('Fetching all services with search filter');
				services = await this.getAllServicesWithSearchFilter(sortBy, sortOrder, offset, limit, searchKey);
			} else {
				logger.nonPhi.info('Fetching all services without any search filter');
				services = await this.getAllServicesWithoutFilter(sortBy, sortOrder, offset, limit);
			}
			const attributesDefinition = await this.getAttributesDefinition(),
				servicesMap = new Map<number, object>();
			services.forEach((service) => {
				service = { ...service, serviceid: service.serviceID, servicename: service.serviceName };
				let attributesForListRow = [],
					serviceAttributeArr = [];
				if (service.metadata !== null) {
					service.metadata = JSON.parse(service.metadata);
					serviceAttributeArr = Object.values(service.metadata.attributes).map((attributeID: any) => attributeID);
					attributesForListRow = this.getServiceAttributesDefinition(attributesDefinition, serviceAttributeArr);
				}
				if (servicesMap.has(service.serviceid)) {
					const existingService = { ...service };
					existingService.attributes = this.getServiceAttributesDefinition(attributesDefinition, serviceAttributeArr);

					const _service = JSON.parse(JSON.stringify(servicesMap.get(service.serviceid)));
					_service.statuses.push(this.getServiceDetails(existingService));
					if (service.status === 'ACTIVE' || service.status === 'INACTIVE') {
						_service.servicename = service.servicename;
						_service.attributes = attributesForListRow;
					}

					this.removeVersionSpecificDetailsFromService(service);
					servicesMap.set(_service.serviceid, _service);
				} else {
					const existingService = { ...service };
					existingService.attributes = this.getServiceAttributesDefinition(attributesDefinition, serviceAttributeArr);
					service.statuses = [this.getServiceDetails(existingService)];
					this.removeVersionSpecificDetailsFromService(existingService);
					if (service.status === 'ACTIVE' || service.status === 'INACTIVE') {
						service.attributes = attributesForListRow;
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
			logger.nonPhi.info('Returning the list of all services.');
			return response;
		} catch (error) {
			logger.nonPhi.error('Error while fetching all the services', error);
			throw new HandleError({ name: 'ServiceListFetchError', message: error.message, stack: error.stack, errorStatus: error.statusCode });
		}
	}

	public async getNonInActiveServicesList(sortBy: string, sortOrder: string, offset: number, limit: number, searchKey: string): Promise<{}> {
		try {
			let services = [];
			if (searchKey !== EMPTY_STRING) {
				logger.nonPhi.info('Fetching all the non inactive services with search filter');
				services = await this.getNonInActiveServicesWithSearchFilter(sortBy, sortOrder, offset, limit, searchKey);
			} else {
				logger.nonPhi.info('Fetching all the non inactive services without search filter');
				services = await this.getAllNonInActiveServicesWithoutFilter(sortBy, sortOrder, offset, limit);
			}

			const attributesDefinition = await this.getAttributesDefinition(),
				servicesMap = new Map<number, object>();
			services.forEach((service) => {
				service = { ...service, serviceid: service.serviceID };
				if (service.servicename === undefined) {
					service.servicename = service.serviceName;
				}
				let attributesForListRow = [],
					serviceAttributeArr = [];
				if (service.metadata !== null) {
					serviceAttributeArr = Object.values(service.metadata.attributes).map((attributeID: any) => attributeID);
					attributesForListRow = this.getServiceAttributesDefinition(attributesDefinition, serviceAttributeArr);
				}
				if (servicesMap.has(service.serviceid)) {
					const existingService = { ...service };
					existingService.attributes = this.getServiceAttributesDefinition(attributesDefinition, serviceAttributeArr);
					const _service = JSON.parse(JSON.stringify(servicesMap.get(service.serviceid)));
					_service.statuses.push(this.getServiceDetails(existingService));
					if (service.status === 'ACTIVE') {
						_service.servicename = service.servicename;
						_service.attributes = attributesForListRow;
					}
					this.removeVersionSpecificDetailsFromService(service);
					servicesMap.set(_service.serviceid, _service);
				} else {
					const existingService = { ...service };
					existingService.attributes = this.getServiceAttributesDefinition(attributesDefinition, serviceAttributeArr);
					service.statuses = [this.getServiceDetails(existingService)];
					this.removeVersionSpecificDetailsFromService(existingService);
					if (service.status === 'ACTIVE') {
						service.attributes = attributesForListRow;
					}
					servicesMap.set(service.serviceid, service);
				}
			});
			const count = await this.getTotalNonInActiveServices();
			let filteredCount = count;
			if (searchKey !== EMPTY_STRING) {
				filteredCount = await this.getTotalNonInActiveServicesFiltered(searchKey);
			}
			const response = {
				totalServices: filteredCount,
				nonFilteredServicesCount: count,
				services: [...servicesMap.values()]
			};
			logger.nonPhi.info('Returning all the non inactive services.');
			return response;
		} catch (error) {
			logger.nonPhi.error('Error while fetching all the non inactive services', error);
			throw new HandleError({ name: 'NonInActiveServicesListFetchError', message: error.message, stack: error.stack, errorStatus: error.statusCode });
		}
	}

	private async getTotalServices(): Promise<number> {
		logger.nonPhi.info('Returning the count of all services including inactive services.');
		const data = await db.query(QGetAllServiceIDsCountWithInactive(), {
			type: QueryTypes.SELECT,
			replacements: {}
		});
		return Number(data[0].count);
	}
	private async getTotalServicesFiltered(searchKey): Promise<number> {
		logger.nonPhi.info('Returning the count of total number of inactive services with filter');
		const data = await db.query(QGetAllServiceIDsCountInactiveWithFilter(), {
			type: QueryTypes.SELECT,
			replacements: { searchKey }
		});
		return Number(data[0].count);
	}

	private async getNonInActiveServicesWithSearchFilter(sortBy: string, sortOrder: string, offset: number, limit: number, searchKey: string): Promise<[]> {
		const ids = await db.query(QGetAllServiceIDsWithFilter(sortBy, sortOrder), {
			type: QueryTypes.SELECT,
			replacements: { limit, offset, searchKey }
		});
		const idsArr = Object.values(ids).map((obj: any) => obj.serviceID);
		if (idsArr.length === 0) return [];
		return await db.query(QGetAllServicesFromServiceIDWithFilter(sortBy, sortOrder, idsArr.join(',')), {
			type: QueryTypes.SELECT,
			replacements: { limit, offset, searchKey }
		});
	}

	private async getAllNonInActiveServicesWithoutFilter(sortBy: string, sortOrder: string, offset: number, limit: number): Promise<[]> {
		const ids = await db.query(QGetAllServiceIDs(sortBy, sortOrder), {
			type: QueryTypes.SELECT,
			replacements: { limit, offset }
		});
		const idsArr = Object.values(ids).map((obj: any) => obj.serviceID);
		logger.nonPhi.debug('ServiceIDs', { idsArr });
		if (idsArr.length === 0) {
			return [];
		}
		return await db.query(QGetAllServicesFromServiceID(sortBy, sortOrder, idsArr.join(',')), {
			type: QueryTypes.SELECT,
			replacements: { limit, offset }
		});
	}

	private async getAllServicesWithSearchFilter(sortBy: string, sortOrder: string, offset: number, limit: number, searchKey: string): Promise<[]> {
		const ids = await db.query(QGetAllServiceIDsWithInactiveFilter(sortBy, sortOrder), {
				type: QueryTypes.SELECT,
				replacements: { limit, offset, searchKey }
			}),
			idsArr = Object.values(ids).map((obj: any) => obj.serviceID);
		logger.nonPhi.debug('ServiceIDs', { idsArr });
		if (idsArr.length === 0) return [];
		return await db.query(QGetAllServicesFromServiceIDWithInactiveFilter(sortBy, sortOrder, idsArr.join(',')), {
			type: QueryTypes.SELECT,
			replacements: { limit, offset }
		});
	}

	private async getAllServicesWithoutFilter(sortBy: string, sortOrder: string, offset: number, limit: number): Promise<[]> {
		let sortByNumber = 2;
		if (sortBy === 'serviceID') sortByNumber = 1;
		const ids = await db.query(QGetAllServiceIDsWithInactive(sortByNumber, sortOrder), {
				type: QueryTypes.SELECT,
				replacements: { limit, offset }
			}),
			idsArr = Object.values(ids).map((obj: any) => obj.serviceID);
		logger.nonPhi.debug('ServiceIDs', { idsArr });
		if (idsArr.length === 0) return [];
		return await db.query(QGetAllServicesFromServiceIDWithInactive(sortBy, sortOrder, idsArr.join(',')), {
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
		logger.nonPhi.info('Returning the count of total number of non inactive services.');
		const data = await db.query(QGetAllServiceIDsCount(), {
			type: QueryTypes.SELECT,
			replacements: {}
		});
		return Number(data[0].count);
	}
	private async getTotalNonInActiveServicesFiltered(searchKey): Promise<number> {
		logger.nonPhi.info('Returning the count of total number of non inactive services with filter.');
		const data = await db.query(QGetAllServiceIDsCountWithFilter(), {
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
		const arr = [];
		attributesDefinition.forEach((obj) => {
			if (ids.includes(obj.attributesDefinitionID)) {
				arr.push(obj.name);
			}
		});
		return arr;
	}

	public async processBulkAttributesRequest(file: Express.Multer.File, reqHeaders: any): Promise<object> {
		try {
			logger.nonPhi.info('Parsing the input excel file begins.');
			const dataFromXL = await this.parseInputExcel(file);

			logger.nonPhi.info('Data validation for the user input begins.');
			return await this.validateUserInput(dataFromXL, reqHeaders);
		} catch (error) {
			logger.nonPhi.error(error.message, { _err: error });
			throw new HandleError({ name: 'BulkAttributesProcessingError', message: error.message, stack: error.stack, errorStatus: HTTP_STATUS_CODES.internalServerError });
		}
	}

	private async parseInputExcel(file: Express.Multer.File): Promise<any> {
		try {
			const workbook = XLSX.read(file.buffer, { cellDates: true }),
				first_worksheet = workbook.Sheets[workbook.SheetNames[0]],
				dataFromXL = XLSX.utils.sheet_to_json(first_worksheet, { header: 1, raw: false, dateNF: 'MM/DD/YYYY' });

			logger.nonPhi.info('Successfully parsed and returning the excel content in json format.');
			return dataFromXL;
		} catch (error: any) {
			logger.nonPhi.error(error.message, { _err: error });
			throw new HandleError({ name: 'BulkAttributesExcelParsingError', message: error.message, stack: error.stack, errorStatus: HTTP_STATUS_CODES.internalServerError });
		}
	}

	private async validateUserInput(userInput: any, reqHeaders: any): Promise<any> {
		try {
			const errorRecords = [];
			var totalFailedServices = 0;
			for (var row = 1; row < userInput.length; row++) {
				const legacyTIPDetailID = Number(userInput[row][1]);

				logger.nonPhi.debug('Getting the matching services from database for given TIP ID ', { legacyTIPDetailID });

				const existingServices = await this.serviceRepository.findAll({
					where: {
						legacyTIPDetailID
					}
				});

				logger.nonPhi.info('Checking the given TIP ID has only active version.');
				var onlyActiveVersion = await this.checkExistingServicesHasOnlyActiveVersion(userInput, existingServices, errorRecords, row);
				var validScheduleDates, validFrom, validTill;
				const addEmptyAttrList: any = [];
				if (userInput[row][5] !== undefined) {
					validScheduleDates = await this.validScheduledDates(userInput, userInput[row][5], userInput[row][6], errorRecords, row);
					validFrom = moment(userInput[row][5]).format(DATE_FORMAT);
					validTill = userInput[row][6] ? moment(userInput[row][6]).format(DATE_FORMAT) : null;
				} else {
					validFrom = moment.tz(moment().add(1, 'days'), CLIENT_TZ).format(DATE_FORMAT);
					validTill = userInput[row][6] ? moment(userInput[row][6]).format(DATE_FORMAT) : null;
					validScheduleDates = true;
				}
				if (onlyActiveVersion && validScheduleDates) {
					const attributesDefinitions = await this.getAllAttributesDefinition();
					var attributesDefinitionIDs_toAdd = await this.getAttributesDefinitionIDs(
						attributesDefinitions,
						userInput[row][3],
						existingServices[0],
						errorRecords,
						ERROR_MSG_ADD_ATTRIBUTES,
						row
					);
					var attributesDefinitionIDs_toDelete = await this.getAttributesDefinitionIDs(
						attributesDefinitions,
						userInput[row][4],
						existingServices[0],
						errorRecords,
						ERROR_MSG_REMOVE_ATTRIBUTES,
						row
					);

					if (attributesDefinitionIDs_toAdd.length !== 0 || attributesDefinitionIDs_toDelete.length !== 0) {
						await this.validateServiceAttributes(
							existingServices[0],
							attributesDefinitions,
							attributesDefinitionIDs_toAdd,
							attributesDefinitionIDs_toDelete,
							errorRecords,
							row,
							addEmptyAttrList
						);
					}

					if (attributesDefinitionIDs_toAdd.length > 0 || attributesDefinitionIDs_toDelete.length > 0 || addEmptyAttrList[0] === 1) {
						logger.nonPhi.debug('After successfull validation and association of service attributes, creating a draft version for the active service.');
						const draft_service = await this.createDraft(existingServices[0].serviceID);
						await this.createServiceAttributes(existingServices[0], draft_service.draftVersion, attributesDefinitionIDs_toAdd);
						logger.nonPhi.debug('Scheduling the service with following data. ', (existingServices[0].serviceID, draft_service.draftVersion, validFrom, validTill));
						await this.schedule(existingServices[0].serviceID, draft_service.draftVersion, validFrom, validTill);
						logger.nonPhi.debug('Publishing a schedule event to the SNS topic.');
						this.snsServiceManager.parentPublishScheduleMessageToSNSTopic(
							existingServices[0].serviceID,
							existingServices[0].legacyTIPDetailID,
							existingServices[0].globalServiceVersion,
							startDateWithClientTZ(validFrom),
							validTill,
							existingServices[0].isPublished,
							reqHeaders,
							SERVICE_SCHEDULE_EVENT
						);
						const activeService = JSON.parse(JSON.stringify(await this.getActiveService(existingServices[0].serviceID)));
						if (activeService !== null) {
							const endDate = activeService.validTill ? activeService.validTill : endDateWithClientTZ(moment(validFrom).subtract(1, 'days').format(DATE_FORMAT));
							logger.nonPhi.debug('Publishing a change event to the SNS topic to update end date for the active version of the service.');
							this.snsServiceManager.parentPublishScheduleMessageToSNSTopic(
								existingServices[0].serviceID,
								existingServices[0].legacyTIPDetailID,
								activeService.globalServiceVersion,
								activeService.validFrom,
								endDate,
								activeService.isPublished,
								reqHeaders,
								SERVICE_CHANGE_EVENT
							);
						}
					} else {
						totalFailedServices += 1;
					}
				} else totalFailedServices += 1;
			}
			logger.nonPhi.info('Successfully validated all the rows and generating the response.');
			return {
				totalRowCount: userInput.length - 1,
				totalSuccessfullServices: userInput.length - 1 - totalFailedServices,
				totalFailedServices: totalFailedServices,
				failedServiceAttributesList: errorRecords
			};
		} catch (error: any) {
			logger.nonPhi.error(error.message, { _err: error });
			if (error instanceof HandleError) throw error;
			throw new HandleError({ name: 'BulkAttributesValidationError', message: error.message, stack: error.stack, errorStatus: HTTP_STATUS_CODES.internalServerError });
		}
	}

	private async validScheduledDates(userInput: any, startDate: any, endDate: any, errorRecords: any, row: number): Promise<boolean> {
		const validFrom = moment(startDate).format(DATE_FORMAT);
		const validTill = endDate ? moment(endDate).format(DATE_FORMAT) : null;
		const today: any = moment.tz(moment().add(1, 'days'), CLIENT_TZ).format(DATE_FORMAT);

		if (validFrom < today) {
			logger.nonPhi.error('Invalid start date is provided. Start Date is lesser than current date.');
			errorRecords.push({
				tipID: userInput[row][1],
				serviceID: userInput[row][0],
				serviceName: userInput[row][2],
				failureReason: 'Invalid start date is provided. Start Date is lesser than current date.',
				row: row + 1
			});
			return false;
		}
		if (validTill && validTill < today) {
			logger.nonPhi.error('Invalid end date is provided. End Date is lesser than current date.');
			errorRecords.push({
				tipID: userInput[row][1],
				serviceID: userInput[row][0],
				serviceName: userInput[row][2],
				failureReason: 'Invalid end date is provided. End Date is lesser than current date.',
				row: row + 1
			});
			return false;
		}

		if (validTill && validFrom > validTill) {
			logger.nonPhi.error('End Date is lesser than start date.');
			errorRecords.push({
				tipID: userInput[row][1],
				serviceID: userInput[row][0],
				serviceName: userInput[row][2],
				failureReason: 'End Date is lesser than start date.',
				row: row + 1
			});
			return false;
		}
		return true;
	}

	private async getAllAttributesDefinition(): Promise<any> {
		var attributesDefinitions_masterData = await db.query(QGetAllAttributesDefinition, {
			type: QueryTypes.SELECT
		});
		const attrDefMap = new Map<String, number>();
		attributesDefinitions_masterData.map((attrDef) => {
			const cat_attr = attrDef.categoryName.trim().toLowerCase() + ':' + attrDef.name.trim().toLowerCase();
			attrDefMap.set(cat_attr.replace(/\s+/g, '').replace(/^,+|,+$/g, ''), attrDef.attributesDefinitionID);
		});
		return attrDefMap;
	}

	private async validateServiceAttributes(
		activeService: Service,
		attributesDefinitions: Map<String, number>,
		attributesToBeAdded: any,
		attributesToBeRemoved: [],
		errorRecords: any,
		row: any,
		addEmptyAttrList: any[]
	) {
		try {
			const existingServiceAttributes = await this.serviceAttributesRepository.findOne({
				where: { serviceID: activeService.serviceID, globalServiceVersion: activeService.globalServiceVersion }
			});
			if (existingServiceAttributes !== null) {
				var existingMetadata = existingServiceAttributes.metadata.attributes;

				attributesToBeAdded?.forEach((attrDefID: any) => {
					if (!existingMetadata.includes(attrDefID)) existingMetadata.push(attrDefID);
				});

				attributesToBeRemoved?.forEach((attrDefID) => {
					var index = existingMetadata.indexOf(attrDefID);
					if (index !== -1) {
						existingMetadata.splice(index, 1);
					} else {
						const errAttribute = [];
						attributesDefinitions?.forEach((value, key) => {
							if (value === attrDefID) {
								errAttribute.push(key);
							}
						});
						errorRecords.push({
							tipID: activeService.legacyTIPDetailID,
							serviceID: activeService.serviceID,
							serviceName: activeService.serviceName,
							failureReason: errAttribute[0] + ERROR_MSG_NON_ASSOCIATED_ATTRIBUTES,
							row: row + 1
						});
					}
				});
				attributesToBeAdded.length = 0;
				if (existingMetadata.length === 0) addEmptyAttrList.push(1);
				else addEmptyAttrList.push(0);
			} else {
				attributesToBeRemoved.length = 0;
			}
			existingMetadata?.forEach((element) => {
				attributesToBeAdded.push(element);
			});
			return attributesToBeAdded;
		} catch (error: any) {
			logger.nonPhi.error(error.message, { _err: error });
			if (error instanceof HandleError) throw error;
			throw new HandleError({ name: 'BulkAttributesDBInsertionError', message: error.message, stack: error.stack, errorStatus: HTTP_STATUS_CODES.internalServerError });
		}
	}
	private async createServiceAttributes(activeService: Service, draftVersion: any, attributesToBeAdded: any) {
		try {
			logger.nonPhi.debug('creating new service attributes metadata ', { attributesToBeAdded });
			await this.serviceAttributesRepository.create({
				metadata: { attributes: attributesToBeAdded },
				serviceID: activeService.serviceID,
				globalServiceVersion: draftVersion
			});
		} catch (error: any) {
			logger.nonPhi.error(error.message, { _err: error });
			if (error instanceof HandleError) throw error;
			throw new HandleError({ name: 'BulkAttributesDBInsertionError', message: error.message, stack: error.stack, errorStatus: HTTP_STATUS_CODES.internalServerError });
		}
	}

	private async getAttributesDefinitionIDs(
		attributesDefinitions: Map<String, number>,
		categoryAttributesCollection: any,
		activeService: Service,
		errorRecords: any,
		errorMessage: string,
		row: number
	): Promise<any> {
		const attributesDefinitionIDs = [];
		categoryAttributesCollection = categoryAttributesCollection?.replace(/^,+|,+$/g, '');
		categoryAttributesCollection?.split(',')?.forEach(async (cat_attribute: any) => {
			try {
				const category_attribute = cat_attribute.trim().toLowerCase().replace(/\s+/g, '');
				if (attributesDefinitions.has(category_attribute) && !attributesDefinitionIDs.includes(attributesDefinitions.get(category_attribute))) {
					attributesDefinitionIDs.push(attributesDefinitions.get(category_attribute));
				} else {
					errorRecords.push({
						tipID: activeService.legacyTIPDetailID,
						serviceID: activeService.serviceID,
						serviceName: activeService.serviceName,
						failureReason: cat_attribute + errorMessage,
						row: row + 1
					});
				}
			} catch (error: any) {
				logger.nonPhi.error(error.message, { _err: error });
			}
		});
		return attributesDefinitionIDs;
	}
	public async persistIncomingRequestForBulkAttributes(fileName: string, status: string, userID: string): Promise<any> {
		try {
			logger.nonPhi.debug('Creating a request entry in BulkAttributesStatus table with following values ', { fileName, status, userID });
			return await this.bulkServiceAttributesRepository.create({ fileName, status, createdBy: userID });
		} catch (error: any) {
			logger.nonPhi.error(error.message, { _err: error });
			throw new HandleError({ name: 'BulkAttributesRequestInsertionError', message: error.message, stack: error.stack, errorStatus: HTTP_STATUS_CODES.internalServerError });
		}
	}

	public async checkExistingServicesHasOnlyActiveVersion(userInput: any, existingServices: any, errorRecords: any, row: any): Promise<boolean> {
		if (existingServices.length === 0) {
			logger.nonPhi.debug('Given TIP ID does not exist in the system.');
			errorRecords.push({
				tipID: userInput[row][1],
				serviceID: userInput[row][0],
				serviceName: userInput[row][2],
				failureReason: 'Given TIP ID does not exist in the system.',
				row: row + 1
			});
			return false;
		}
		if (existingServices.filter((service: any) => service.status.includes(SCHEDULED) || service.status.includes(DRAFT)).length > 0) {
			logger.nonPhi.debug('Given TIP ID has non-active version in the system (scheduled or draft version).');
			errorRecords.push({
				tipID: userInput[row][1],
				serviceID: userInput[row][0],
				serviceName: userInput[row][2],
				failureReason: 'Given TIP ID has non-active version in the system (scheduled or draft version).',
				row: row + 1
			});
			return false;
		}
		existingServices = existingServices.find((service: any) => service.status === ACTIVE);
		return true;
	}

	public async updateMetricsAndStatusForBulkAttributesRequest(bulkAttributesRequest: any, response: any): Promise<any> {
		try {
			const status = response.totalSuccessfullServices >= 1 ? REQUEST_COMPLETED : REQUEST_FAILED;
			await this.bulkServiceAttributesRepository.update(
				{
					totalRecords: response.totalRowCount,
					successfullyProcessedRecords: response.totalSuccessfullServices,
					totalFailedRecords: response.totalFailedRecords,
					errorReason: response.failureReason,
					status
				},
				{ where: { bulkServiceAttributesStatusID: bulkAttributesRequest.bulkServiceAttributesStatusID } }
			);
		} catch (error: any) {
			logger.nonPhi.error(error.message, { _err: error });
			if (error instanceof HandleError) throw error;
			throw new HandleError({ name: 'BulkAttributesRequestUpdationError', message: error.message, stack: error.stack, errorStatus: HTTP_STATUS_CODES.internalServerError });
		}
	}
}
