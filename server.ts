import express, { Application, NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import httpContext from 'express-http-context';
import { auth, contextStore, errorHandler, generateLogId, requestLogger } from './src/middleware';
import { HandleError } from './utils';
import csurf from 'csurf';
import { InternalRouterManager } from './src/routes/internal/internal-router-manager';
import config from 'config';
import { initKeyclock } from './config/keycloak-config';
import session from 'express-session';
import swaggerUi from 'swagger-ui-express';
import * as swaggerDocument from './swagger.json';
import * as swaggerExternalDocument from './swagger-external.json';

const memoryStore = new session.MemoryStore(),
	keycloak = initKeyclock(memoryStore),
	PORT = Number(process.env.PORT) || 8080,
	app: Application = express();

import { ExternalRouterManager } from './src/routes/external/external-router-manager';
import actuator from 'express-actuator';
dotenv.config();

app.use(
	session({
		secret: process.env.NODE_ENV,
		resave: false,
		saveUninitialized: true,
		store: memoryStore,
		cookie: { secure: true }
	})
);

app.use(
	cors({
		credentials: true,
		methods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
		allowedHeaders: ['Origin', 'Content-Type', 'Accept', 'Accept-Language', 'Cookies', 'x-xsrf-token'],
		origin: config.get('allowedOrigins')
	})
);
app.use((req: Request, res: Response, next: NextFunction) => {
	res.setHeader('X-Frame-Options', 'DENY');
	res.setHeader('Content-Security-Policy', "frame-ancestors 'none'");
	next();
});

app.use(helmet());
app.use(express.urlencoded({ extended: false }));
app.use(actuator());
//middlewares for each request
app.use(cookieParser());
app.use(requestLogger);
app.use(express.json());
app.use(httpContext.middleware);
app.use(contextStore);
app.use(generateLogId);
app.use('/actuator/health',(req: Request, res: Response, next: NextFunction) => {
	res.json({"status":"UP"});
});
app.use(/^((?!external|swagger).)*$/i, auth); // authenticate every route except /swagger

app.get('/', (req: Request, res: Response, _next: NextFunction) => {
	res.send('Service Configuration is UP!');
});

/**
 * Swagger route
 */
var swaggerOptions = {};
app.use('/external-swagger', swaggerUi.serveFiles(swaggerExternalDocument, swaggerOptions), swaggerUi.setup(swaggerExternalDocument));
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// keycloak-adapter middleware
app.use(keycloak.middleware());
app.use('/service', ExternalRouterManager);
app.use(csurf({ cookie: { secure: true, httpOnly: true } }));

app.use('/service/internal', InternalRouterManager);

// set csrf token in the cookie
app.get('/csrf', (req, res, _next) => {
	res.cookie('XSRF-TOKEN', req.csrfToken());
	res.status(200).json({ success: true });
});

/**
 * NotFound Route
 */
app.use((req: Request, res: Response, next: NextFunction) => {
	next(new HandleError({ name: 'NotFound', message: 'You have landed on an incorrect route.', stack: 'Not Found', errorStatus: 404 }));
});
app.use(errorHandler);
app.listen(PORT, () => {
	process.stdout.write(`Base Service config server started at ${PORT}`);
	
	console.log(process.env);
});
