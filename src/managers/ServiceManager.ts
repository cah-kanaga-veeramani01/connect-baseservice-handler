import { Repository } from 'sequelize-typescript';
import { Service } from '../../database/models/Service';
import { HandleError, logger } from '../../utils';
import { IService } from '../interfaces/IServices';

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
			logger.nonPhi.info('Created a New Service Successfully.');
			return result;
		} catch (error) {
			logger.nonPhi.error(error.message, { _err: error });
			throw new HandleError({ name: 'CreateServiceError', message: error.message, stack: error.stack, errorStatus: error.statusCode });
		}
	}
}
