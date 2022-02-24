import { Router } from 'express';
import { isAuthorized, validateRequest } from '../../middleware';
import { Subject, UserAction } from '../../models/defineAbility';
import db from '../../../database/DBManager';
import { ServiceType } from '../../../database/models/ServiceType';
import ServiceTypeManager from '../../managers/ServiceTypeManager';
import ServiceTypeController from '../../controllers/ServiceTypeController';
import { addServiceType, getAllServiceTypes } from '../../models/schema';

const serviceTypeController = new ServiceTypeController(new ServiceTypeManager(db.getRepository(ServiceType)));
export const ServiceTypesInternalRouter = Router({ mergeParams: true });

ServiceTypesInternalRouter.route('/')
	.post(isAuthorized(UserAction.create, Subject.policy), validateRequest(addServiceType), serviceTypeController.createServiceType.bind(serviceTypeController))
	.get(isAuthorized(UserAction.read, Subject.policy), validateRequest(getAllServiceTypes), serviceTypeController.getAllServiceTypes.bind(serviceTypeController));
