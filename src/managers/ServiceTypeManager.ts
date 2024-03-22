import { Repository } from 'sequelize-typescript';
import { ServiceType } from '../../database/models/ServiceType';
import { IServiceType } from '../interfaces/IServices';
import { logger, HandleError, HTTP_STATUS_CODES } from '../../utils';
import httpContext from 'express-http-context';

export default class ServiceTypeManager {
	constructor(public serviceTypeRepository: Repository<ServiceType>) {}

	public async createServiceType(serviceTypePayload: IServiceType) {
		try {
			const serviceTypeAlreadyExists = await this.serviceTypeRepository.findOne({ where: { serviceType: serviceTypePayload.serviceType } });
			if (serviceTypeAlreadyExists) {
				throw new HandleError({
					name: 'ServiceTypeAlreadyExistsError',
					message: 'Service Type already present in the system',
					stack: 'Service Type already exists in the system',
					errorStatus: HTTP_STATUS_CODES.badRequest
				});
			}
			const result = await this.serviceTypeRepository.create({ serviceType: serviceTypePayload.serviceType, createdBy: httpContext.get('userId') });
			logger.nonPhi.info('Created a new service type successfully.');
			return result;
		} catch (error) {
			if (error instanceof HandleError) throw error;
			throw new HandleError({ name: 'CreateServiceTypeError', message: error.message, stack: error.stack, errorStatus: error.statusCode });
		}
	}

	public async getAllServiceTypes() {
		try {
			const result = await this.serviceTypeRepository.findAll();
			if (result.length) logger.nonPhi.info('Able to fetch all service types successfully.');
			return result;
		} catch (error) {
			throw new HandleError({ name: 'ServiceTypeFetchError', message: error.message, stack: error.stack, errorStatus: error.statusCode });
		}
	}
}
