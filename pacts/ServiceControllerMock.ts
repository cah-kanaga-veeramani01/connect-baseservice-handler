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
						serviceID: 1,
						legacyTIPDetailID: 31,
						globalServiceVersion: 2,
						validFrom: '2023-05-10T04:00:00.000Z',
						validTill: null,
						status: 'ACTIVE',
						attributes: {
							Class: ['COSTALT', 'AMP'],
							Group: ['LEGACY'],
							Role: ['TECHELIGIBLE']
						}
					},
					{
						serviceID: 2,
						legacyTIPDetailID: 32,
						globalServiceVersion: 1,
						validFrom: '2014-12-08T16:23:47.850Z',
						validTill: '2023-05-20T03:59:59.999Z',
						status: 'ACTIVE',
						attributes: {}
					}
				],
				totalServices: 15
			});
		} catch (error) {
			next(error);
		}
	}
}
