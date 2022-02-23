import { Repository } from 'sequelize-typescript';
import { Service } from '../../database/models/Service';
import { HandleError } from '../../utils';
import { IService, ServiceListResponse } from '../interfaces/IServices';
import { serviceList, EMPTY_STRING } from '../../utils/constants';
import { QServiceList } from '../../database/queries/service';
import db from '../../database/DBManager';
import { QueryTypes } from 'sequelize';

export default class ServiceManager {
	constructor(public serviceRepository: Repository<Service>) {}

	public async createService(servicePayload: IService) {
		try {
			const result = await this.serviceRepository.create({
				serviceName: servicePayload.serviceName,
				serviceDisplayName: servicePayload.serviceDisplayName,
				serviceTypeID: servicePayload.serviceTypeID,
				globalServiceVersion: 1,
				validFrom: new Date(),
				isPublished: 1
			});
			return result;
		} catch (error) {
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
}
