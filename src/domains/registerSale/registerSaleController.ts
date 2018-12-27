import * as express from 'express';
import { injectable, inject } from 'inversify';

import SERVICE_IDENTIFIER from '../../constants/identifiers';
import { RegisterSaleService } from './registerSaleService';
import { RegistrableController } from '../../interfaces/registerableController';
import { RegisterSale } from 'pos-models';
import { EventPublisher } from "../../shared/eventPublisher";
import { RegisterSaleClosedEvent } from "./registerSaleClosedEventHandler";

@injectable()
export class RegisterSaleController implements RegistrableController {

  constructor(@inject(SERVICE_IDENTIFIER.RegisterSaleService) private registerSaleService: RegisterSaleService,
    @inject(SERVICE_IDENTIFIER.EventPublisher) private eventPublisher: EventPublisher) {
  }

  public register(app: express.Application): void {
    app.route('/api/registerSale')
      .get(async (req: any, res: express.Response, next: express.NextFunction) => {
        const sales = await this.registerSaleService.getRegisterSalesByTimeRange(
          req.user.tenantId,
          req.params.startTime,
          req.params.endTime
        );
        res.json(sales);
      })
      .post(async (req: any, res: express.Response, next: express.NextFunction) => {
        const createdRegisterSale = await this.registerSaleService.createRegisterSale(req.user.tenantId, req.body)
          .catch(err => next(err));
        res.json(createdRegisterSale);
      })
      .put(async (req: any, res: express.Response, next: express.NextFunction) => {
        console.log('register sale update request');
        const updateRegisterSale = await this.registerSaleService.updateRegisterSale(req.user.tenantId, req.body)
          .catch(err => next(err));
        res.json(updateRegisterSale);
      });

    app.post('/api/registerSale/close', async (req: any, res: express.Response, next: express.NextFunction) => {
      const updateRegisterSale = await this.registerSaleService.createRegisterSale(req.user.tenantId, req.body)
        .catch(err => next(err));
      this.eventPublisher.publish(new RegisterSaleClosedEvent(req.user.tenantId, req.body));
      res.json(updateRegisterSale);
    });
  }
}
