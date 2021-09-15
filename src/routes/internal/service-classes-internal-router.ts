import { Router } from 'express';
import { ServiceClass } from '../../../database/models/ServiceClass';
import ServiceClassController from '../../controllers/ServiceClassController';
import { isAuthorized } from '../../middleware';
import { Subject, UserAction } from '../../models/defineAbility';
import ServiceClassManager from '../../managers/ServiceClassManager';
import db from '../../../database/DBManager';

const serviceClassController = new ServiceClassController(new ServiceClassManager(db.getRepository(ServiceClass)));
export const ServiceClassesInternalRouter = Router({ mergeParams: true });

ServiceClassesInternalRouter.post('/', isAuthorized(UserAction.create, Subject.policy), serviceClassController.createServiceClasses.bind(serviceClassController));
ServiceClassesInternalRouter.get('/', isAuthorized(UserAction.read, Subject.policy), serviceClassController.getAllServiceClasses.bind(serviceClassController));
