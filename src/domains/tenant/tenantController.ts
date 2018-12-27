import * as express from 'express';
import { injectable, inject } from 'inversify';

import {Auth} from '../../auth/auth';
import SERVICE_IDENTIFIER from '../../constants/identifiers';
import { RegistrableController } from '../../interfaces/registerableController';

@injectable()
export class TenantController implements RegistrableController {
  private _authService: Auth;

  constructor( @inject(SERVICE_IDENTIFIER.AuthService) authService: Auth) {
    this._authService = authService;
  }

  public register(app: express.Application): void {
    app.route('/tenant')
      .get(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        res.json({ status: true });
      })
      .post(async (req: any, res: express.Response, next: express.NextFunction) => {
        const tenant = await this._authService.createUser(req.body)
          .catch(err => next(err));
        res.json(tenant);
      });
  }
}
