import { Router } from 'express';
import { isAuthorized } from '../../middleware';
import { Subject, UserAction } from '../../models/defineAbility';
import db from '../../../database/DBManager';
import { ServiceType } from '../../../database/models/ServiceType';
import ServiceTypeManager from '../../services/ServiceTypeManager';
import ServiceTypeController from '../../controllers/ServiceTypeController';

const serviceTypeController = new ServiceTypeController(new ServiceTypeManager(db.getRepository(ServiceType)));
export const ServiceTypesInternalRouter = Router({ mergeParams: true });

ServiceTypesInternalRouter.post('/', isAuthorized(UserAction.create, Subject.policy), serviceTypeController.createServiceType.bind(serviceTypeController));
ServiceTypesInternalRouter.get('/', isAuthorized(UserAction.read, Subject.policy), serviceTypeController.getAllServiceTypes.bind(serviceTypeController));
