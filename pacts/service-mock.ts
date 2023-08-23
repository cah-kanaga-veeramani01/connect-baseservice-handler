import { Router } from 'express';
import { getServiceAttributesSchema } from '../src/models/externalSchema';
import { validateRequest } from '../src/middleware';
import ServiceControllerMock from './ServiceControllerMock';

export const ServiceRoute = Router();
const serviceController = new ServiceControllerMock();

ServiceRoute.route('/attributes').get(validateRequest(getServiceAttributesSchema), serviceController.getServiceAttributesDetails.bind(serviceController));
