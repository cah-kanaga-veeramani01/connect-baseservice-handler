import { Router } from 'express';
import ServiceController from '../../controllers/ServiceController';
import { isAuthorized, validateRequest } from '../../middleware';
import { Subject, UserAction } from '../../models/defineAbility';
import ServiceManager from '../../managers/ServiceManager';
import db from '../../../database/DBManager';
import { Service } from '../../../database/models/Service';
import { getServiceListSchema } from '../../requestSchema';

const serviceController = new ServiceController(new ServiceManager(db.getRepository(Service)));
export const ServicesInternalRouter = Router({ mergeParams: true });

ServicesInternalRouter.route('/').post(isAuthorized(UserAction.create, Subject.policy), serviceController.createService.bind(serviceController));
ServicesInternalRouter.route('/list').get(isAuthorized(UserAction.read, Subject.policy), validateRequest(getServiceListSchema), serviceController.getServiceList.bind(serviceController));
