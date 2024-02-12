import { NextFunction, Request, Response, Router } from 'express';
import ServiceController from '../../controllers/ServiceController';
import { isAuthorized, validateRequest } from '../../middleware';
import { Subject, UserAction } from '../../models/defineAbility';
import ServiceManager from '../../managers/ServiceManager';
import db from '../../../database/DBManager';
import { Service } from '../../../database/models/Service';
import { ServiceType } from '../../../database/models/ServiceType';
import { addService, createDraft, getModuleEntriesSchema, getServiceListSchema, updateModuleconfig, scheduleService, getServiceDetails } from '../../models/schema';
import { ServiceModuleConfig } from '../../../database/models/ServiceModuleConfig';
import SNSServiceManager from '../../managers/SNSServiceManager';
import httpContext from 'express-http-context';
import multer from 'multer';
import { BulkServiceAttributesStatus } from '../../../database/models/BulkServiceAttributesStatus';
import { ServiceAttributes } from '../../../database/models/ServiceAttributes';

const serviceController = new ServiceController(
	new ServiceManager(
		db.getRepository(Service),
		db.getRepository(ServiceType),
		db.getRepository(ServiceModuleConfig),
		db.getRepository(BulkServiceAttributesStatus),
		db.getRepository(ServiceAttributes),
		new SNSServiceManager()
	),
	new SNSServiceManager()
);
export const ServicesInternalRouter = Router({ mergeParams: true });
const multerUpload = multer({ storage: multer.memoryStorage() });
ServicesInternalRouter.route('/').post(isAuthorized(UserAction.create, Subject.service), validateRequest(addService), serviceController.createService.bind(serviceController));
ServicesInternalRouter.route('/list').get(isAuthorized(UserAction.read, Subject.service), validateRequest(getServiceListSchema), serviceController.getServiceList.bind(serviceController));
ServicesInternalRouter.route('/draft').post(isAuthorized(UserAction.create, Subject.service), validateRequest(createDraft), serviceController.createDraft.bind(serviceController));
ServicesInternalRouter.route('/:serviceID/modules').post(
	isAuthorized(UserAction.create, Subject.service),
	validateRequest(updateModuleconfig),
	serviceController.addModuleConfig.bind(serviceController)
);
ServicesInternalRouter.route('/unmappedModules').get(
	isAuthorized(UserAction.read, Subject.service),
	validateRequest(getModuleEntriesSchema),
	serviceController.getModuleEntries.bind(serviceController)
);
ServicesInternalRouter.route('/schedule').put(isAuthorized(UserAction.update, Subject.service), validateRequest(scheduleService), serviceController.schedule.bind(serviceController));
ServicesInternalRouter.route('/details').get(isAuthorized(UserAction.read, Subject.service), validateRequest(getServiceDetails), serviceController.getDetails.bind(serviceController));
ServicesInternalRouter.route('/activeServices').get(isAuthorized(UserAction.read, Subject.service), serviceController.getActiveServices.bind(serviceController));
ServicesInternalRouter.route('/associateBulkServiceAttributes').post(
	isAuthorized(UserAction.create, Subject.service),
	(req: Request, res: Response, next: NextFunction) => {
		req.params.userId = httpContext.get('userId');
		next();
	},
	multerUpload.single('bulkServiceAttributesDoc'),
	serviceController.createBulkServiceAttributes.bind(serviceController)
);
