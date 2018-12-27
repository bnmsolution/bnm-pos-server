import * as express from 'express';
import {injectable, inject} from 'inversify';

import SERVICE_IDENTIFIER from '../../constants/identifiers';
import {StoreService} from './storeService';
import {RegistrableController} from '../../interfaces/registerableController';

@injectable()
export class StoreController implements RegistrableController {

  constructor(@inject(SERVICE_IDENTIFIER.StoreService) private storeService: StoreService) {
  }

  public register(app: express.Application): void {
    app.route('/api/store')
      .post(async (req: any, res: express.Response, next: express.NextFunction) => {
        const createdSettings = await this.storeService.createStore(req.user.tenantId, req.body)
          .catch(err => next(err));
        res.json(createdSettings);
      })
      .put(async (req: any, res: express.Response, next: express.NextFunction) => {
        const updatedSettings = await this.storeService.updateStore(req.user.tenantId, req.body)
          .catch(err => next(err));
        res.json(updatedSettings);
      })
  }
}
