import { Repository } from 'sequelize-typescript';
import { ServiceTag } from '../../database/models/ServiceTag';
import { IServiceClass } from '../interfaces/IServices';
import { logger, HandleError, HTTP_STATUS_CODES } from '../../utils';

export default class ServiceClassManager {
	constructor(public serviceClassRepository: Repository<ServiceTag>) {}

	public async createServiceClasses(serviceClassPayload: IServiceClass) {
		try {
			const serviceClassRecords = serviceClassPayload.serviceClassNames.map((item) => ({ serviceClassName: item, serviceTypeID: serviceClassPayload.serviceTypeID, createdBy: 'admin' }));
			const result = await this.serviceClassRepository.bulkCreate(serviceClassRecords);
			logger.nonPhi.info('Created Service Classes Successfully.');
			return result;
		} catch (error) {
			logger.nonPhi.error(error.message, { _err: error });
			throw new HandleError({ name: 'CreateServiceClassError', message: error.message, stack: error.stack, errorStatus: HTTP_STATUS_CODES.internalServerError });
		}
	}

	public async getAllServiceClasses(serviceTypeID: number) {
		try {
			const result = await this.serviceClassRepository.findAll({ where: { serviceTypeID } });
			if (result.length) logger.nonPhi.info('Able to fetch all service classes successfully.');
			return result;
		} catch (error) {
			logger.nonPhi.error(error.message, { _err: error });
			throw new HandleError({ name: 'ServiceClassFetchError', message: error.message, stack: error.stack, errorStatus: HTTP_STATUS_CODES.internalServerError });
		}
	}
}
