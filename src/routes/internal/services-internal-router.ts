import { Router } from 'express';
import ServiceController from '../../controllers/ServiceController';
import { isAuthorized } from '../../middleware';
import { Subject, UserAction } from '../../models/defineAbility';
import ServiceManager from '../../managers/ServiceManager';
import db from '../../../database/DBManager';
import { Service } from '../../../database/models/Service';

const serviceController = new ServiceController(new ServiceManager(db.getRepository(Service)));
export const ServicesInternalRouter = Router({ mergeParams: true });

ServicesInternalRouter.route('/').post(isAuthorized(UserAction.create, Subject.policy), serviceController.createService.bind(serviceController));
