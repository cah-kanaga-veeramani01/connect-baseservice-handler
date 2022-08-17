import { Router } from 'express';
import ServiceController from '../../controllers/ServiceController';
import { validateRequest } from '../../middleware';
import ServiceManager from '../../managers/ServiceManager';
import db from '../../../database/DBManager';
import { Service } from '../../../database/models/Service';
import { ServiceTagMapping } from '../../../database/models/ServiceTagMapping';
import { ServiceTag } from '../../../database/models/ServiceTag';
import { ServiceType } from '../../../database/models/ServiceType';
import { testSchema } from '../../models/schema';
import { getKeycloak } from '../../../config/keycloak-config';

const serviceController = new ServiceController(new ServiceManager(db.getRepository(Service), db.getRepository(ServiceTagMapping), db.getRepository(ServiceTag), db.getRepository(ServiceType))),
	keycloak = getKeycloak(),
	SERVICE_API_READ = process.env.SERVICE_READ_ROLE;
export const ServicesExternalRouter = Router({ mergeParams: true });

ServicesExternalRouter.route('/test').get(keycloak.protect(SERVICE_API_READ), validateRequest(testSchema), serviceController.test.bind(serviceController));
