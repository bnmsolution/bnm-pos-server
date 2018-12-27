import * as express from 'express';
import { injectable, inject } from 'inversify';

import SERVICE_IDENTIFIER from '../../constants/identifiers';
import { VendorService } from './vendorService';
import { RegistrableController } from '../../interfaces/registerableController';

@injectable()
export class VendorController implements RegistrableController {
  private _vendorService: VendorService;

  constructor( @inject(SERVICE_IDENTIFIER.VendorService) vendorService: VendorService) {
    this._vendorService = vendorService;
  }

  public register(app: express.Application): void {
    app.route('/api/vendor')
      .get(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        res.json({ status: true });
      })
      .post(async (req: any, res: express.Response, next: express.NextFunction) => {
        const createdVendor = await this._vendorService.createVendor(req.user.tenantId, req.body)
          .catch(err => next(err));
        res.json(createdVendor);
      })
      .put(async (req: any, res: express.Response, next: express.NextFunction) => {
        const updateVendor = await this._vendorService.updateVendor(req.user.tenantId, req.body)
          .catch(err => next(err));
        res.json(updateVendor);
      });

    app.route('/api/vendor/:id')
      .delete(async (req: any, res: express.Response, next: express.NextFunction) => {
        const deletedVendor = await this._vendorService.deleteVendor(req.user.tenantId, req.params.id)
          .catch(err => next(err));
        res.json(deletedVendor);
      });
  }
}
