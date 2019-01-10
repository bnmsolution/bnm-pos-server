import * as express from 'express';
import { injectable, inject } from 'inversify';

import SERVICE_IDENTIFIER from '../../constants/identifiers';
import { CustomerService } from './customerService';
import { RegistrableController } from '../../interfaces/registerableController';
import { EventPublisher } from '../../shared/eventPublisher';
import { ApplyRewardPointEvent } from './applyRewardPointEventHandler';

@injectable()
export class CustomerController implements RegistrableController {

  @inject(SERVICE_IDENTIFIER.CustomerService)
  private customerService: CustomerService;

  @inject(SERVICE_IDENTIFIER.EventPublisher)
  private eventPublisher: EventPublisher;

  public register(app: express.Application): void {
    app.route('/api/customer')
      .get(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        res.json({ status: true });
      })
      .post(async (req: any, res: express.Response, next: express.NextFunction) => {
        const createdCustomer = await this.customerService.createCustomer(req.user.tenantId, req.body)
          .catch(err => next(err));
        res.json(createdCustomer);
      })
      .put(async (req: any, res: express.Response, next: express.NextFunction) => {
        const updateCustomer = await this.customerService.updateCustomer(req.user.tenantId, req.body)
          .catch(err => next(err));
        res.json(updateCustomer);
      });

    app.route('/api/requestPoints')
      .post(async (req: any, res: express.Response, next: express.NextFunction) => {
        const { saleId } = req.body;
        const pointRequestAccepted = await this.customerService.applyRewardPoints(req.user.tenantId, req.body)
          .catch(err => next(err));

        if (pointRequestAccepted) {
          const { customerId, earnedPoints, isNewCustomer } = pointRequestAccepted;
          this.eventPublisher.publish(new ApplyRewardPointEvent(req.user.tenantId, saleId, customerId, isNewCustomer, earnedPoints));
        }

        res.json(pointRequestAccepted);
      })
  }
}
