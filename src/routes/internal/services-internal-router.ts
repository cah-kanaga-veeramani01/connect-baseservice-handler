import { Router } from 'express';
import ServiceController from '../../controllers/ServiceController';
import { isAuthorized, validateRequest } from '../../middleware';
import { Subject, UserAction } from '../../models/defineAbility';
import ServiceManager from '../../managers/ServiceManager';
import db from '../../../database/DBManager';
import { Service } from '../../../database/models/Service';
import { ServiceTagMapping } from '../../../database/models/ServiceTagMapping';
import { addService } from '../../models/schema';
import { ServiceTag } from '../../../database/models/ServiceTag';
import { ServiceType } from '../../../database/models/ServiceType';

const serviceController = new ServiceController(new ServiceManager(db.getRepository(Service), db.getRepository(ServiceTagMapping), db.getRepository(ServiceTag), db.getRepository(ServiceType)));
export const ServicesInternalRouter = Router({ mergeParams: true });

ServicesInternalRouter.route('/').post(isAuthorized(UserAction.create, Subject.policy), validateRequest(addService), serviceController.createService.bind(serviceController));
