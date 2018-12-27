import * as express from 'express';
import { injectable, inject } from 'inversify';

import SERVICE_IDENTIFIER from '../../constants/identifiers';
import { CustomerService } from './customerService';
import { RegistrableController } from '../../interfaces/registerableController';

@injectable()
export class CustomerController implements RegistrableController {
  private _customerService: CustomerService;

  constructor( @inject(SERVICE_IDENTIFIER.CustomerService) customerService: CustomerService) {
    this._customerService = customerService;
  }

  public register(app: express.Application): void {
    app.route('/api/customer')
      .get(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        res.json({ status: true });
      })
      .post(async (req: any, res: express.Response, next: express.NextFunction) => {
        const createdCustomer = await this._customerService.createCustomer(req.user.tenantId, req.body)
          .catch(err => next(err));
        res.json(createdCustomer);
      })
      .put(async (req: any, res: express.Response, next: express.NextFunction) => {
        const updateCustomer = await this._customerService.updateCustomer(req.user.tenantId, req.body)
          .catch(err => next(err));
        res.json(updateCustomer);
      })
  }
}
