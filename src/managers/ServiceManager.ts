import { Repository } from 'sequelize-typescript';
import { Service } from '../../database/models/Service';
import { serviceList, EMPTY_STRING } from '../../utils/constants';
import { QServiceList, QServiceDetails } from '../../database/queries/service';
import { Op, QueryTypes } from 'sequelize';
import { ServiceTagMapping } from '../../database/models/ServiceTagMapping';
import { HandleError, HTTP_STATUS_CODES, logger } from '../../utils';
import { IService, ServiceListResponse } from '../interfaces/IServices';
import db from '../../database/DBManager';
import httpContext from 'express-http-context';
import { ServiceTag } from '../../database/models/ServiceTag';
import { ServiceType } from '../../database/models/ServiceType';

export default class ServiceManager {
	constructor(
		public serviceRepository: Repository<Service>,
		public serviceTagMappingRepository: Repository<ServiceTagMapping>,
		public serviceTagsRepository: Repository<ServiceTag>,
		public serviceTypeRepository: Repository<ServiceType>
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

			const serviceTags = await this.serviceTagsRepository.findAll({ where: { serviceTagID: { [Op.in]: servicePayload.serviceTagIDs } } });
			if (serviceTags?.length !== servicePayload.serviceTagIDs.length) {
				throw new HandleError({
					name: 'ServiceTagDoesNotExistsError',
					message: 'Service Tag does not exists in the system',
					stack: 'Service Tag not found in the system',
					errorStatus: HTTP_STATUS_CODES.notFound
				});
			}
			const result = await db.transaction(async (t: any) => {
				const service = await this.serviceRepository.create(
					{
						serviceName: servicePayload.serviceName,
						serviceDisplayName: servicePayload.serviceDisplayName,
						serviceTypeID: servicePayload.serviceTypeID,
						globalServiceVersion: 1,
						validFrom: new Date(),
						isPublished: 1,
						createdBy: httpContext.get('userId')
					},
					{ transaction: t }
				);
				const serviceMappingPayload = servicePayload.serviceTagIDs.map((tag) => ({ serviceID: service.serviceID, globalServiceVersion: service.globalServiceVersion, serviceTagID: tag })),
					stmResult = await this.serviceTagMappingRepository.bulkCreate(serviceMappingPayload, { transaction: t });
				logger.nonPhi.debug('Created a New Service Successfully.');
				logger.nonPhi.debug('Mapped tags with service successfully.');

				const serviceTagMappingIDs = [];
				stmResult.map((item) => {
					serviceTagMappingIDs.push(item.serviceTagMappingID);
				});
				const serviceResponse = service.toJSON();

				return { ...serviceResponse, serviceTagMappingIDs, serviceTagIDs: servicePayload.serviceTagIDs };
			});
			return result;
		} catch (error) {
			if (error instanceof HandleError) throw error;
			throw new HandleError({ name: 'CreateServiceError', message: error.message, stack: error.stack, errorStatus: error.statusCode });
		}
	}

	public async getServiceList(sortBy: string, sortOrder: string, offset: number, limit: number, keyword: string, statusFilter: string): Promise<ServiceListResponse> {
		try {
			let totalServices = [];
			let services = [];
			let nonFilteredServices = [];
			let status = statusFilter.toLowerCase() === serviceList.defaultFilterBy.toLowerCase() ? serviceList.matchAll : statusFilter;
			let searchKey =
				keyword !== EMPTY_STRING
					? keyword
							.trim()
							.split(' ')
							.map((key) => serviceList.matchAll + key + serviceList.matchAll)
					: serviceList.matchAll;

			// query to get total count of services filtered by status & search key
			totalServices = await db.query(QServiceList(sortBy ?? serviceList.defaultSortBy, sortOrder), {
				type: QueryTypes.SELECT,
				replacements: { searchKey, limit: null, offset: null, status, sortBy, sortOrder }
			});

			//query to fetch all services matching all criteria
			services = await db.query(QServiceList(sortBy ?? serviceList.defaultSortBy, sortOrder), {
				type: QueryTypes.SELECT,
				replacements: { searchKey, limit, offset, status, sortBy, sortOrder }
			});

			// query to get total count of services with no filter
			status = serviceList.matchAll;
			searchKey = serviceList.matchAll;
			nonFilteredServices = await db.query(QServiceList(sortBy ?? serviceList.defaultSortBy, sortOrder), {
				type: QueryTypes.SELECT,
				replacements: { searchKey, limit: null, offset: null, status, sortBy, sortOrder }
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

			const newDraftVersion = await this.serviceRepository.create(selectedService, {
				returning: true,
				fields: ['serviceID', 'serviceName', 'serviceDisplayName', 'globalServiceVersion', 'isPublished', 'serviceTypeID', 'legacyTIPDetailID', 'validFrom', 'validTill']
			});
			return { ...newDraftVersion, scheduledVersion: null, draftVersion: newDraftVersion.globalServiceVersion };
		} catch (error: any) {
			logger.nonPhi.error(error.message, { _err: error });
			if (error instanceof HandleError) throw error;
			throw new HandleError({ name: 'ServiceDraftFetchError', message: error.message, stack: error.stack, errorStatus: HTTP_STATUS_CODES.internalServerError });
		}
	}
}
