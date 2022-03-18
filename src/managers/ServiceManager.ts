import { Repository } from 'sequelize-typescript';
import { Service } from '../../database/models/Service';
import { ServiceTagMapping } from '../../database/models/ServiceTagMapping';
import { HandleError, HTTP_STATUS_CODES, logger } from '../../utils';
import { IService } from '../interfaces/IServices';
import db from '../../database/DBManager';
import httpContext from 'express-http-context';
import { ServiceTag } from '../../database/models/ServiceTag';
import { Op } from 'sequelize';
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
				const serviceMappingPayload = servicePayload.serviceTagIDs.map((tag) => ({ serviceID: service.serviceID, serviceTagID: tag })),
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
}
