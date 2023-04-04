import { Repository } from 'sequelize-typescript';
import { Service } from '../../database/models/Service';
import {
	QAddModuleConfig,
	QCheckConfigCount,
	QGetServiceAttributesMetaData,
	QGetServiceAttributesName,
	QServiceActiveOrInActive,
	QServiceActiveVersionForLegacyId,
	QUpdateModuleConfig
} from '../../database/queries/service';
import { QueryTypes } from 'sequelize';
import { HandleError, HTTP_STATUS_CODES, logger } from '../../utils';
import db from '../../database/DBManager';
import { ServiceModuleConfig } from '../../database/models/ServiceModuleConfig';

export default class ExternalServiceManager {
	constructor(public serviceRepository: Repository<Service>, public ServiceModuleConfigRepository: Repository<ServiceModuleConfig>) {}

	/**
	 * Function to update moduleID and version of the service
	 * @function post
	 * @async
	 * @param {number} serviceID -  serviceID of for the service moduleConfig
	 * @param {number} moduleID -  containing the moduleID in the serviceModuleConfig
	 * @param {number} moduleVersion - moduleVersion is same as globalServiceVersion of the service
	 */
	async addModuleConfig(serviceID: number, moduleVersion: number, moduleID: number) {
		try {
			logger.nonPhi.debug('AddModuleConfig API invoked with following parameters', { serviceID, moduleVersion, moduleID });
			const serviceDetails: any = await this.serviceRepository.findOne({ where: { serviceID, globalServiceVersion: moduleVersion } });
			if (!serviceDetails) {
				throw new HandleError({ name: 'ServiceDoesntExist', message: 'Service does not exist', stack: 'Service does not exist', errorStatus: HTTP_STATUS_CODES.notFound });
			}
			const configCount = await db.query(QCheckConfigCount, {
				replacements: { serviceID: serviceID, moduleID },
				type: QueryTypes.SELECT
			});
			if (Number(configCount[0].count) > 0) {
				await db.query(QUpdateModuleConfig, {
					replacements: { serviceID, moduleID, moduleVersion },
					type: QueryTypes.UPDATE,
					raw: true
				});
			} else {
				await db.query(QAddModuleConfig, {
					replacements: { serviceID, moduleID, moduleVersion },
					type: QueryTypes.INSERT,
					raw: true
				});
			}
		} catch (error: any) {
			logger.nonPhi.error(error.message, { _err: error });
			if (error instanceof HandleError) throw error;
			throw new HandleError({ name: 'ServiceModuleUpdateError', message: error.message, stack: error.stack, errorStatus: HTTP_STATUS_CODES.internalServerError });
		}
	}

	/**
	 * Function to get service attributes for serviceID opr legacyTipID
	 * @function get
	 * @async
	 * @param {number} serviceID -  serviceID of for fetching active service attributes
	 * @param {number} legacyTIPDetailID -  legacyTIPDetailID of for fetching active service attributes
	 */
	async getServiceAttributesDetails(serviceID, legacyTIPDetailID) {
		try {
			logger.nonPhi.debug('getServiceAttributesDetails API invoked with following parameters', { serviceID, legacyTIPDetailID });
			let output;
			if (!legacyTIPDetailID) {
				const serviceDetails: any = await this.serviceRepository.findOne({ where: { serviceID } });
				if (!serviceDetails) {
					throw new HandleError({ name: 'ServiceDoesntExist', message: 'Service does not exist', stack: 'Service does not exist', errorStatus: HTTP_STATUS_CODES.badRequest });
				}
				const activeOrInActiveService = await db.query(QServiceActiveOrInActive, {
					replacements: { serviceID: serviceID },
					type: QueryTypes.SELECT,
					raw: true
				});
				if (!activeOrInActiveService[0]) {
					throw new HandleError({
						name: 'ActiveServiceVersionDoesntExist',
						message: 'Active Service version does not exist',
						stack: 'Active Service version does not exist',
						errorStatus: HTTP_STATUS_CODES.badRequest
					});
				}
				const serviceAttributes = await db.query(QGetServiceAttributesMetaData, {
					replacements: { serviceID, globalServiceVersion: activeOrInActiveService[0].globalServiceVersion },
					type: QueryTypes.SELECT,
					raw: true
				});
				output = await this.GetAttributeNames(serviceAttributes, output);
			} else {
				const serviceDetailsforLegacyID: any = await this.serviceRepository.findOne({ where: { legacyTIPDetailID } });
				if (!serviceDetailsforLegacyID) {
					throw new HandleError({
						name: 'LegacyTipIDDoesntExist',
						message: 'legacyTIPDetailID does not exist',
						stack: 'legacyTIPDetailID does not exist',
						errorStatus: HTTP_STATUS_CODES.badRequest
					});
				}
				const activeOrInActiveService = await db.query(QServiceActiveVersionForLegacyId, {
					replacements: { legacyTIPDetailID: legacyTIPDetailID },
					type: QueryTypes.SELECT,
					raw: true
				});
				if (!activeOrInActiveService[0]) {
					throw new HandleError({
						name: 'ActiveServiceVersionDoesntExist',
						message: 'Active Service version does not exist',
						stack: 'Active Service version does not exist',
						errorStatus: HTTP_STATUS_CODES.badRequest
					});
				}
				const serviceAttributes = await db.query(QGetServiceAttributesMetaData, {
					replacements: { serviceID: activeOrInActiveService[0].serviceID, globalServiceVersion: activeOrInActiveService[0].globalServiceVersion },
					type: QueryTypes.SELECT,
					raw: true
				});
				output = await this.GetAttributeNames(serviceAttributes, output);
			}
			return output;
		} catch (error: any) {
			logger.nonPhi.error(error.message, { _err: error });
			if (error instanceof HandleError) throw error;
			throw new HandleError({ name: 'ServiceAttributesFetchError', message: error.message, stack: error.stack, errorStatus: HTTP_STATUS_CODES.internalServerError });
		}
	}

	private async GetAttributeNames(serviceAttributes: any, output: any) {
		const attrStr = serviceAttributes[0].attributes;
		const result = attrStr.slice(1, -1).split(',').map(Number);

		const serviceAttributesDetails = await db.query(QGetServiceAttributesName, {
			replacements: { attributesDefinitionID: result },
			type: QueryTypes.SELECT
		});
		const grouped = serviceAttributesDetails.reduce((acc, obj) => {
			if (!acc[obj.categoryName]) {
				acc[obj.categoryName] = [];
			}
			acc[obj.categoryName].push(obj.name);
			return acc;
		}, {});

		output = Object.keys(grouped).map((key) => ({
			[key]: grouped[key]
		}));
		return output;
	}
}
