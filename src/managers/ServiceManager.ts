import { Repository } from 'sequelize-typescript';
import { Service } from '../../database/models/Service';
import { ServiceTagMapping } from '../../database/models/ServiceTagMapping';
import { HandleError, HTTP_STATUS_CODES, logger } from '../../utils';
import { IService } from '../interfaces/IServices';

export default class ServiceManager {
	constructor(public serviceRepository: Repository<Service>, public serviceTagMappingRepository: Repository<ServiceTagMapping>) {}

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
			const service = await this.serviceRepository.create({
				serviceName: servicePayload.serviceName,
				serviceDisplayName: servicePayload.serviceDisplayName,
				serviceTypeID: servicePayload.serviceTypeID,
				globalServiceVersion: 1,
				validFrom: new Date(),
				isPublished: 1,
				createdBy: 'admin'
			});
			logger.nonPhi.info('Created a New Service Successfully.');
			const serviceMappingPayload = servicePayload.serviceTagIDs.map((tag) => ({ serviceID: service.serviceID, serviceTagID: tag }));
			await this.serviceTagMappingRepository.bulkCreate(serviceMappingPayload);
			logger.nonPhi.info('Mapped tags with service successfully.');
			return service;
		} catch (error) {
			if (error instanceof HandleError) throw error;
			throw new HandleError({ name: 'CreateServiceError', message: error.message, stack: error.stack, errorStatus: error.statusCode });
		}
	}
}
