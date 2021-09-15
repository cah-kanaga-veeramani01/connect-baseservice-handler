import { Repository } from 'sequelize-typescript';
import { Service } from '../../database/models/Service';
import { ServiceClass as ServiceClassModel } from '../../database/models/ServiceClass';
import { ServiceType } from '../../database/models/ServiceType';
import { HandleError, logger } from '../../utils';
import { IService, IServiceClass, IServiceType } from '../interfaces/IServices';

export default class ServiceManager {
	constructor(public serviceClassRepository: Repository<ServiceClassModel>, public serviceTypeRepository: Repository<ServiceType>, public serviceRepository: Repository<Service>) {}

	public async createServiceClass(serviceClassPayload: IServiceClass) {
		try {
			const serviceClassRecords = serviceClassPayload.serviceClassNames.map((item) => ({ serviceClassName: item, serviceTypeID: serviceClassPayload.serviceTypeID, createdBy: 'admin' }));
			return await this.serviceClassRepository.bulkCreate(serviceClassRecords);
		} catch (error) {
			logger.nonPhi.error(error.message, { _err: error });
			throw new HandleError({ name: 'CreateServiceClassError', message: error.message, stack: error.stack, errorStatus: error.statusCode });
		}
	}

	public async createServiceType(serviceTypePayload: IServiceType) {
		try {
			return await this.serviceTypeRepository.create(serviceTypePayload);
		} catch (error) {
			logger.nonPhi.error(error.message, { _err: error });
			throw new HandleError({ name: 'CreateServiceTypeError', message: error.message, stack: error.stack, errorStatus: error.statusCode });
		}
	}

	public async getAllServiceClasses(serviceTypeID: number) {
		try {
			return await this.serviceClassRepository.findAll({ where: { serviceTypeID } });
		} catch (error) {
			logger.nonPhi.error(error.message, { _err: error });
			throw new HandleError({ name: 'ServiceClassFetchError', message: error.message, stack: error.stack, errorStatus: error.statusCode });
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

	public async createService(servicePayload: IService) {
		try {
			return await this.serviceRepository.create({
				serviceName: servicePayload.serviceName,
				serviceDisplayName: servicePayload.serviceDisplayName,
				serviceTypeID: servicePayload.serviceTypeID,
				globalServiceVersion: 1,
				validFrom: new Date(),
				isPublished: true
			});
		} catch (error) {
			logger.nonPhi.error(error.message, { _err: error });
			throw new HandleError({ name: 'CreateServiceError', message: error.message, stack: error.stack, errorStatus: error.statusCode });
		}
	}
}
