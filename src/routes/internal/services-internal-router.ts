import { Router } from 'express';
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

const serviceController = new ServiceController(new ServiceManager(db.getRepository(Service), db.getRepository(ServiceType), db.getRepository(ServiceModuleConfig)), new SNSServiceManager());
export const ServicesInternalRouter = Router({ mergeParams: true });

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
