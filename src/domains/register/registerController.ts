import * as express from 'express';
import {injectable, inject} from 'inversify';

import SERVICE_IDENTIFIER from '../../constants/identifiers';
import {RegisterService} from './registerService';
import {RegistrableController} from '../../interfaces/registerableController';

@injectable()
export class RegisterController implements RegistrableController {
  private _registerService: RegisterService;

  constructor(@inject(SERVICE_IDENTIFIER.RegisterService) registerService: RegisterService) {
    this._registerService = registerService;
  }

  public register(app: express.Application): void {
    app.route('/api/register')
      .get(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        res.json({status: true});
      })
      .post(async (req: any, res: express.Response, next: express.NextFunction) => {
        const createdRegister = await this._registerService.createRegister(req.user.tenantId, req.body)
          .catch(err => next(err));
        res.json(createdRegister);
      })
      .put(async (req: any, res: express.Response, next: express.NextFunction) => {
        const updateRegister = await this._registerService.updateRegister(req.user.tenantId, req.body)
          .catch(err => next(err));
        res.json(updateRegister);
      });
  }
}
