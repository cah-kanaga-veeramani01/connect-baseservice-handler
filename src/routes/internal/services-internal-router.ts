import { Router } from 'express';
import ServiceController from '../../controllers/ServiceController';
import { isAuthorized, validateRequest } from '../../middleware';
import { Subject, UserAction } from '../../models/defineAbility';
import ServiceManager from '../../managers/ServiceManager';
import db from '../../../database/DBManager';
import { Service } from '../../../database/models/Service';
import { ServiceType } from '../../../database/models/ServiceType';
import { addService, createDraft, getServiceListSchema } from '../../models/schema';

const serviceController = new ServiceController(new ServiceManager(db.getRepository(Service), db.getRepository(ServiceType)));
export const ServicesInternalRouter = Router({ mergeParams: true });

ServicesInternalRouter.route('/').post(isAuthorized(UserAction.create, Subject.service), validateRequest(addService), serviceController.createService.bind(serviceController));
ServicesInternalRouter.route('/list').get(isAuthorized(UserAction.read, Subject.service), validateRequest(getServiceListSchema), serviceController.getServiceList.bind(serviceController));
ServicesInternalRouter.route('/draft').post(isAuthorized(UserAction.create, Subject.service), validateRequest(createDraft), serviceController.createDraft.bind(serviceController));
