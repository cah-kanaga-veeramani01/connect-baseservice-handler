import { Repository } from 'sequelize-typescript';
import { Service } from '../../database/models/Service';
import { ServiceTagMapping } from '../../database/models/ServiceTagMapping';
import { HandleError, logger } from '../../utils';
import { IService } from '../interfaces/IServices';

export default class ServiceManager {
	constructor(public serviceRepository: Repository<Service>, public serviceTagMappingRepository: Repository<ServiceTagMapping>) {}

	public async createService(servicePayload: IService) {
		try {
			const service = await this.serviceRepository.create({
				serviceName: servicePayload.serviceName,
				serviceDisplayName: servicePayload.serviceDisplayName,
				serviceTypeID: servicePayload.serviceTypeID,
				globalServiceVersion: 1,
				validFrom: new Date(),
				isPublished: 1
			});
			logger.nonPhi.info('Created a New Service Successfully.');
			const serviceMappingPayload = servicePayload.serviceTagIDs.map((tag) => ({ serviceID: service.serviceID, serviceTagID: tag }));
			await this.serviceTagMappingRepository.bulkCreate(serviceMappingPayload);
			return service;
		} catch (error) {
			throw new HandleError({ name: 'CreateServiceError', message: error.message, stack: error.stack, errorStatus: error.statusCode });
		}
	}
}
