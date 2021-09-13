import { Router } from 'express';
import ClassController from '../controllers/ClassController';
import { isAuthorized } from '../middleware';
import { Subject, UserAction } from '../models/defineAbility';
import CLassService from '../services/service-class';
import db from '../../database/DBManager';
import { ServiceClass } from '../../database/models/ServiceClass';

const classController = new ClassController(new CLassService(db.getRepository(ServiceClass)));
export const ClassRouter = Router({ mergeParams: true });

ClassRouter.post('/', isAuthorized(UserAction.read, Subject.policy), classController.crateClass.bind(classController));
