import { Router } from 'express';
import ServiceController from '../controllers/ServiceController';
import { isAuthorized } from '../middleware';
import { Subject, UserAction } from '../models/defineAbility';

const service = new ServiceController();
export const ServiceRoute = Router();

ServiceRoute.get('/message', isAuthorized(UserAction.read, Subject.policy), service.displayMessage.bind(service));
