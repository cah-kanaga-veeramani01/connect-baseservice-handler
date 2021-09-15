import { Repository } from 'sequelize-typescript';
import { ServiceClass } from '../../database/models/ServiceClass';
import { IServiceClass } from '../interfaces/IServices';
import { logger, HandleError, HTTP_STATUS_CODES } from '../../utils';

export default class ServiceClassManager {
	constructor(public serviceClassRepository: Repository<ServiceClass>) {}

	public async createServiceClasses(serviceClassPayload: IServiceClass) {
		try {
			const serviceClassRecords = serviceClassPayload.serviceClassNames.map((item) => ({ serviceClassName: item, serviceTypeID: serviceClassPayload.serviceTypeID, createdBy: 'admin' }));
			return await this.serviceClassRepository.bulkCreate(serviceClassRecords);
		} catch (error) {
			logger.nonPhi.error(error.message, { _err: error });
			throw new HandleError({ name: 'CreateServiceClassError', message: error.message, stack: error.stack, errorStatus: HTTP_STATUS_CODES.internalServerError });
		}
	}

	public async getAllServiceClasses(serviceTypeID: number) {
		try {
			return await this.serviceClassRepository.findAll({ where: { serviceTypeID } });
		} catch (error) {
			logger.nonPhi.error(error.message, { _err: error });
			throw new HandleError({ name: 'ServiceClassFetchError', message: error.message, stack: error.stack, errorStatus: HTTP_STATUS_CODES.internalServerError });
		}
	}
}
