import { Repository } from 'sequelize-typescript';
import { ServiceTag } from '../../database/models/ServiceTag';
import { logger, HandleError, HTTP_STATUS_CODES } from '../../utils';
import { IServiceTag } from '../interfaces/IServices';

export default class ServiceTagManager {
	constructor(public serviceTagsRepository: Repository<ServiceTag>) {}

	public async createServiceTags(serviceTagPayload: IServiceTag) {
		try {
			const serviceTags = serviceTagPayload.serviceTags.map((item) => ({ serviceTags: item, createdBy: 'admin' }));
			const result = await this.serviceTagsRepository.bulkCreate(serviceTags);
			logger.nonPhi.info('Created Service Tag(s) Successfully.');
			return result;
		} catch (error) {
			logger.nonPhi.error(error.message, { _err: error });
			throw new HandleError({ name: 'CreateServiceTagsError', message: error.message, stack: error.stack, errorStatus: HTTP_STATUS_CODES.internalServerError });
		}
	}

	public async getAllServiceTags() {
		try {
			const result = await this.serviceTagsRepository.findAll();
			if (result.length) logger.nonPhi.info('Able to fetch all service tags successfully.');
			return result;
		} catch (error) {
			logger.nonPhi.error(error.message, { _err: error });
			throw new HandleError({ name: 'ServiceTagsFetchError', message: error.message, stack: error.stack, errorStatus: HTTP_STATUS_CODES.internalServerError });
		}
	}
}
