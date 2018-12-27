import * as express from 'express';
import {injectable, inject} from 'inversify';
import {Product} from 'pos-models'

import SERVICE_IDENTIFIER from '../../constants/identifiers';
import {ProductService} from './productService';
import {RegistrableController} from '../../interfaces/registerableController';
import {EventPublisher} from '../../shared/eventPublisher';
import {ProductCreatedEvent} from './productCreatedEventHandler';
import {RegisterSaleClosedEvent} from '../registerSale/registerSaleClosedEventHandler';


@injectable()
export class ProductController implements RegistrableController {

  constructor(@inject(SERVICE_IDENTIFIER.ProductService) private productService: ProductService,
              @inject(SERVICE_IDENTIFIER.EventPublisher) private eventPublisher: EventPublisher) {
  }

  public register(app: express.Application): void {
    app.route('/api/product')
      .get(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        res.json({status: true});
      })
      .post(async (req: any, res: express.Response, next: express.NextFunction) => {

        const createdProduct = await this.productService.createProduct(req.user.tenantId, req.body)
          .catch(err => next(err));
        this.eventPublisher.publish(new ProductCreatedEvent(req.user.tenantId, req.body));
        res.json(createdProduct);
      })
      .put(async (req: any, res: express.Response, next: express.NextFunction) => {
        const updateProduct = await this.productService.updateProduct(req.user.tenantId, req.body)
          .catch(err => next(err));
        res.json(updateProduct);
      });
  }
}
