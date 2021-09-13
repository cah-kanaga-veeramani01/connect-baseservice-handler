import express, { Express, NextFunction, Request, Response } from 'express';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import { ServiceRoute } from './src/routes/service-router';
import dotenv from 'dotenv';
import config from 'config';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import httpContext from 'express-http-context';
import { auth, contextStore, errorHandler, generateLogId, requestLogger } from './src/middleware';
import { HandleError } from './utils';
import csurf from 'csurf';
import './database/DBManager';
import { ServiceInternalRoute } from './src/routes/service-internal-router';

dotenv.config();

const PORT = Number(process.env.PORT) || 5000;
const app: Express = express();
app.use(
	cors({
		credentials: true,
		methods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
		allowedHeaders: ['Origin', 'Content-Type', 'Accept', 'Accept-Language', 'Cookies', 'x-xsrf-token'],
		origin: config.get('allowedOrigins')
	})
);
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//middlewares for each request
app.use(cookieParser());
app.use(requestLogger);
app.use(express.json());
app.use(httpContext.middleware);
app.use(contextStore);
app.use(generateLogId);
app.use(/(.*\/internal.*)/i, auth);

app.get('/', (req: Request, res: Response) => {
	res.send('<h4>Service Configuration is UP!</h4>');
});

// app.use(csurf({ cookie: true }));

// set csrf token in the cookie
app.get('/csrf', (req, res) => {
	res.cookie('XSRF-TOKEN', req.csrfToken());
	res.status(200).json({ success: true });
});

app.use('/internal/services', ServiceInternalRoute);
app.use('/service', ServiceRoute);

/**
 * NotFound Route
 */
app.use((req: Request, res: Response, next: NextFunction) => {
	next(new HandleError({ name: 'NotFound', message: 'You have landed on an incorrect route.', stack: 'Not Found', errorStatus: 404 }));
});
app.use(errorHandler);
app.listen(PORT);
