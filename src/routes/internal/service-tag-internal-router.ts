import { Router } from 'express';
import { ServiceTag } from '../../../database/models/ServiceTag';
import ServiceClassController from '../../controllers/ServiceTagController';
import { isAuthorized } from '../../middleware';
import { Subject, UserAction } from '../../models/defineAbility';
import ServiceClassManager from '../../managers/ServiceTagManager';
import db from '../../../database/DBManager';

const serviceClassController = new ServiceClassController(new ServiceClassManager(db.getRepository(ServiceTag)));
export const ServiceClassesInternalRouter = Router({ mergeParams: true });

ServiceClassesInternalRouter.route('/').post(isAuthorized(UserAction.create, Subject.policy), serviceClassController.createServiceTags.bind(serviceClassController));
// .get(isAuthorized(UserAction.read, Subject.policy), serviceClassController.getAllServiceClasses.bind(serviceClassController));
