import { Router } from 'express';
import ServiceController from '../controllers/ServiceController';
import { isAuthorized } from '../middleware';
import { Subject, UserAction } from '../models/defineAbility';
import ServiceManager from '../services/ServiceManager';
import db from '../../database/DBManager';
import { ServiceClass } from '../../database/models/ServiceClass';
import { ServiceType } from '../../database/models/ServiceType';
import { Service } from '../../database/models/Service';

const serviceController = new ServiceController(new ServiceManager(db.getRepository(ServiceClass), db.getRepository(ServiceType), db.getRepository(Service)));
export const ServiceInternalRouter = Router({ mergeParams: true });

ServiceInternalRouter.post('/classes', isAuthorized(UserAction.create, Subject.policy), serviceController.createServiceClass.bind(serviceController));
ServiceInternalRouter.get('/classes', isAuthorized(UserAction.read, Subject.policy), serviceController.getAllServiceClasses.bind(serviceController));
ServiceInternalRouter.post('/', isAuthorized(UserAction.create, Subject.policy), serviceController.createService.bind(serviceController));
ServiceInternalRouter.post('/types', isAuthorized(UserAction.create, Subject.policy), serviceController.createServiceType.bind(serviceController));
