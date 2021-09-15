import { Repository } from 'sequelize-typescript';
import { ServiceType as ServiceTypeModel } from '../../database/models/ServiceType';
import { IServiceType } from '../interfaces/IServices';
import { logger, HandleError } from '../../utils';

export default class ServiceTypeManager {
	constructor(public serviceTypeRepository: Repository<ServiceTypeModel>) {}

	public async createServiceType(serviceTypePayload: IServiceType) {
		try {
			return await this.serviceTypeRepository.create(serviceTypePayload);
		} catch (error) {
			logger.nonPhi.error(error.message, { _err: error });
			throw new HandleError({ name: 'CreateServiceTypeError', message: error.message, stack: error.stack, errorStatus: error.statusCode });
		}
	}

	public async getAllServiceTypes() {
		try {
			return await this.serviceTypeRepository.findAll();
		} catch (error) {
			logger.nonPhi.error(error.message, { _err: error });
			throw new HandleError({ name: 'ServiceTypeFetchError', message: error.message, stack: error.stack, errorStatus: error.statusCode });
		}
	}
}
