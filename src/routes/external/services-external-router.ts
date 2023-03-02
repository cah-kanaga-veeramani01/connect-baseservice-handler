import { Router } from 'express';
import externalServiceController from '../../controllers/externalServiceController';
import { validateRequest } from '../../middleware';
import externalServiceManager from '../../managers/externalServiceManager';
import db from '../../../database/DBManager';
import { getKeycloak } from '../../../config/keycloak-config';
import { updateModuleConfig } from '../../models/externalSchema';
import { Service } from '../../../database/models/Service';
import { ServiceModuleConfig } from '../../../database/models/ServiceModuleConfig';

const externalController = new externalServiceController(new externalServiceManager(db.getRepository(Service), db.getRepository(ServiceModuleConfig))),
	keycloak = getKeycloak(),
	SERVICE_API_CREATE = process.env.SERVICE_CREATE_ROLE;
export const ServicesExternalRouter = Router({ mergeParams: true });

ServicesExternalRouter.route('/:serviceID/module/:moduleID').post(
	keycloak.protect(SERVICE_API_CREATE),
	validateRequest(updateModuleConfig),
	externalController.addModuleConfig.bind(externalController)
);
