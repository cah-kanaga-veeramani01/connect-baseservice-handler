import { Router } from 'express';
import { ServiceTag } from '../../../database/models/ServiceTag';
import { isAuthorized, validateRequest } from '../../middleware';
import { Subject, UserAction } from '../../models/defineAbility';
import db from '../../../database/DBManager';
import ServiceTagController from '../../controllers/ServiceTagController';
import ServiceTagManager from '../../managers/ServiceTagManager';
import { addServiceTags, getAllServiceTags } from '../../models/schema';

const serviceTagController = new ServiceTagController(new ServiceTagManager(db.getRepository(ServiceTag)));
export const ServiceTagsInternalRouter = Router({ mergeParams: true });

ServiceTagsInternalRouter.route('/')
	.post(isAuthorized(UserAction.create, Subject.policy), validateRequest(addServiceTags), serviceTagController.createServiceTags.bind(serviceTagController))
	.get(isAuthorized(UserAction.read, Subject.policy), validateRequest(getAllServiceTags), serviceTagController.getAllServiceTags.bind(serviceTagController));
