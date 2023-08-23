import { NextFunction, Request, Response } from 'express';
import { logger } from '../utils';

export default class ServiceControllerMock {
	public async getServiceAttributesDetails(req: Request, res: Response, next: NextFunction) {
		try {
			const serviceID = req.query?.serviceID ? Number(req.query?.serviceID) : null,
				legacyTIPDetailID = req.query?.legacyTIPDetailID ? Number(req.query?.legacyTIPDetailID) : null,
				globalServiceVersion = req.query?.globalServiceVersion ? Number(req.query?.globalServiceVersion) : null,
				sortBy = req.query.sortBy ? String(req.query.sortBy) : 'serviceID',
				sortOrder = req.query.sortOrder ? String(req.query.sortOrder) : 'asc',
				offset = req.query.from ? Number(req.query.from) : 0,
				limit = req.query.limit ? Number(req.query.limit) : 10;
			logger.nonPhi.debug('Get Service attributes details api invoked with following parameter', { serviceID, legacyTIPDetailID, globalServiceVersion, sortBy, sortOrder, offset, limit });
			res.json({
				serviceAttributes: [
					{
						serviceID: serviceID,
						legacyTIPDetailID: legacyTIPDetailID,
						globalServiceVersion: globalServiceVersion,
						validFrom: '2023-05-10T04:00:00.000Z',
						validTill: null,
						status: 'ACTIVE',
						attributes: {
							Class: ['COSTALT', 'AMP'],
							Group: ['LEGACY'],
							Role: ['TECHELIGIBLE']
						}
					}
				],
				totalServices: 15
			});
		} catch (error) {
			logger.nonPhi.error('Error while fetching the attributes details ' + error);
			next(error);
		}
	}
}
