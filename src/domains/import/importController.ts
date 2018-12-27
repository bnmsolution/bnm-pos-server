import * as express from 'express';
import { injectable, inject } from 'inversify';

import SERVICE_IDENTIFIER from '../../constants/identifiers';
import { ImportService } from './importService';
import { RegistrableController } from '../../interfaces/registerableController';

@injectable()
export class ImportController implements RegistrableController {
  @inject(SERVICE_IDENTIFIER.ImportService)
  private _importService: ImportService;

  public register(app: express.Application): void {
    app.route('/api/import/products')
      .post(async (req: any, res: express.Response, next: express.NextFunction) => {
        const tenantId = req.user.tenantId;
        const body = req.body;
        this._importService.importProducts(tenantId, body.products);
        res.json(body);
      })
  }
}
