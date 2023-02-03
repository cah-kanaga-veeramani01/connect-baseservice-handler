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
	QServiceActiveVersion
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
			logger.nonPhi.debug('createDraft invoked with following parameters', { serviceID });

			const serviceDetails: any = await this.getDetails(serviceID);

			if (serviceDetails.draftVersion || serviceDetails.scheduledVersion) {
				return serviceDetails;
			}

			const selectedService = await this.serviceRepository.findOne({
				where: {
					serviceID: serviceDetails.serviceID,
					globalServiceVersion: serviceDetails.activeVersion
				},
				raw: true
			});

			selectedService.isPublished = 0;
			selectedService.validFrom = null;
			selectedService.validTill = null;
			selectedService.globalServiceVersion += 1;

			const newDraftVersion: any = await this.serviceRepository.create(selectedService);
			return {
				...newDraftVersion.dataValues,
				activeVersion: serviceDetails.activeVersion,
				scheduledVersion: null,
				draftVersion: newDraftVersion.globalServiceVersion,
				activeStartDate: serviceDetails.activeStartDate,
				scheduledStartDate: serviceDetails.scheduledStartDate
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
	 * Function to schedule program
	 * @function put
	 * @async
	 * @param {number} serviceID - schedule for particular serviceID
	 * @param {number} globalServiceVersion - schedule for particular serviceVersion
	 * @returns {Promise<object>} - program schedule details
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
			logger.nonPhi.error(error.message, { _err: error });
			if (error instanceof HandleError) throw error;
			throw new HandleError({ name: 'ServiceScheduleError', message: error.message, stack: error.stack, errorStatus: HTTP_STATUS_CODES.internalServerError });
		}
	}

	/**
	 * Function to get the service details
	 * @function get
	 * @async
	 * @param {number} serviceID - get details for particular programId
	 * @returns {Promise<object>} - program details
	 */
	async getDetails(serviceID: number): Promise<object> {
		try {
			const service = await this.serviceRepository.findOne({
				attributes: ['serviceID', 'serviceName', 'serviceDisplayName', 'serviceTypeID', 'legacyTIPDetailID'],
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
			logger.nonPhi.error(error.message, { _err: error });
			if (error instanceof HandleError) throw error;
			throw new HandleError({ name: 'ServiceDetailFetchError', message: error.message, stack: error.stack, errorStatus: HTTP_STATUS_CODES.internalServerError });
		}
	}
}
