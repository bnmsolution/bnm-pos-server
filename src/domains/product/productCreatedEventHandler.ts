import {inject} from 'inversify';
import {Product, createInventory} from 'pos-models';

import SERVICE_IDENTIFIER from '../../constants/identifiers';
import {InventoryService} from "../inventory/inventoryService";
import {ProductService} from "./productService";
import {EventHandler} from "../../shared/eventHandler";
import {EventBase} from "../../shared/event";

export class ProductCreatedEvent implements EventBase {
  constructor(public tenantId: string, public product: Product) {
  }
}

export class ProductCreatedEventHandler extends EventHandler {
  constructor(@inject(SERVICE_IDENTIFIER.ProductService) private productService: ProductService,
              @inject(SERVICE_IDENTIFIER.InventoryService) private inventoryService: InventoryService) {
    super();
  }

  handle(event: ProductCreatedEvent) {
    console.log('ProductCreatedEvent event handler');
    const {tenantId, product} = event;
    if (product.trackInventory) {
      this.inventoryService.createInventory(tenantId, product);
    }
  }
}