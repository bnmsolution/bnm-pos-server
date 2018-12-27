import * as express from 'express';
import {injectable, inject} from 'inversify';

import SERVICE_IDENTIFIER from '../../constants/identifiers';
import {InventoryService} from './inventoryService';
import {RegistrableController} from '../../interfaces/registerableController';

@injectable()
export class InventoryController implements RegistrableController {
  private inventoryService: InventoryService;

  constructor(@inject(SERVICE_IDENTIFIER.InventoryService) inventoryService: InventoryService) {
    this.inventoryService = inventoryService;
  }

  public register(app: express.Application): void {
    app.route('/api/inventory')
      .get(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        res.json({status: true});
      })
      .post(async (req: any, res: express.Response, next: express.NextFunction) => {
        const createdInventory = await this.inventoryService.createInventory(
          req.user.tenantId, req.body.product)
          .catch(err => next(err));
        res.json(createdInventory);
      })
      .put(async (req: any, res: express.Response, next: express.NextFunction) => {
        const updateInventory = await this.inventoryService.updateInventory(req.user.tenantId, req.body)
          .catch(err => next(err));
        res.json(updateInventory);
      })
  }
}
