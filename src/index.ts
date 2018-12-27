import express = require('express');
import http = require('http');
import cors = require('cors');
import * as bodyParser from 'body-parser';


import container from './inversify.config';
import SERVICE_IDENTIFIER from './constants/identifiers';
import { checkJwt } from './middleware/checkJwt';
import { parsetTenantId } from './middleware/parseTenantId';
import { RegistrableController } from './interfaces/registerableController';
import { EventHandler } from "./shared/eventHandler";
import { PosMessageBroker } from './posMessageBroker';

const app: express.Application = express();

const server = http.createServer(app);
// @ts-ignore
global.posMessageBroker = new PosMessageBroker(server);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());


app.use('/api', checkJwt, parsetTenantId);

// grabs the Controller from IoC container and registers all the endpoints
const controllers: RegistrableController[] = container.getAll<RegistrableController>(SERVICE_IDENTIFIER.Controller);
controllers.forEach(controller => controller.register(app));

app.route('/onchange')
  .post(async (req: any, res: express.Response, next: express.NextFunction) => {
    console.log(req.body);
    res.json({ status: true });
  });

server.listen(3000);
