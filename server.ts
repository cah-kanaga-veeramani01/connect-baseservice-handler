import express, { Express, NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import httpContext from 'express-http-context';
import { auth, contextStore, errorHandler, generateLogId, requestLogger } from './src/middleware';
import { HandleError } from './utils';
import csurf from 'csurf';
import { InternalRouterManager } from './src/routes/internal/internal-router-manager';
import { ExternalRouterManager } from './src/routes/external/external-router-manager';
import config from 'config';

dotenv.config();

const PORT = Number(process.env.PORT) || 5000;
const app: Express = express();
console.log("Allowed origins---> ", config.get('allowedOrigins'))
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

//middlewares for each request
app.use(cookieParser());
app.use(requestLogger);
app.use(express.json());
app.use(httpContext.middleware);
app.use(contextStore);
app.use(generateLogId);
app.use(/(.*\/internal.*)/i, auth);

app.get('/', (req: Request, res: Response) => {
	res.send('<h1>Service Configuration is UP!</h1>');
});

app.use(csurf({ cookie: true }));

// set csrf token in the cookie
app.get('/csrf', (req, res) => {
	res.cookie('XSRF-TOKEN', req.csrfToken());
	res.status(200).json({ success: true });
});

app.use('/service/internal', InternalRouterManager);
app.use('/service', ExternalRouterManager);

/**
 * NotFound Route
 */
app.use((req: Request, res: Response, next: NextFunction) => {
	next(new HandleError({ name: 'NotFound', message: 'You have landed on an incorrect route.', stack: 'Not Found', errorStatus: 404 }));
});
app.use(errorHandler);
app.listen(PORT);
