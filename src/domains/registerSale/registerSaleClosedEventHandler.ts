import { injectable, inject } from 'inversify';

import SERVICE_IDENTIFIER from '../../constants/identifiers';
import { InventoryService } from "../inventory/inventoryService";
import { CustomerService } from "../customer/customerService";
import { ProductService } from "../product/productService";
import { EventHandler } from "../../shared/eventHandler";
import { EventBase } from "../../shared/event";
import { Customer, RegisterSale, RegisterPayment, PaymentType, RegisterSaleLineItem } from 'pos-models';
import { StoreService } from '../store/storeService';

declare const posMessageBroker;

export class RegisterSaleClosedEvent implements EventBase {
  constructor(public tenantId: string, public registerSale: RegisterSale) {
  }
}

export class RegisterSaleClosedEventHandler extends EventHandler {

  constructor(@inject(SERVICE_IDENTIFIER.ProductService) private productService: ProductService,
    @inject(SERVICE_IDENTIFIER.InventoryService) private inventoryService: InventoryService,
    @inject(SERVICE_IDENTIFIER.CustomerService) private customerService: CustomerService,
    @inject(SERVICE_IDENTIFIER.StoreService) private storeService: StoreService) {
    super();
  }

  handle(event: RegisterSaleClosedEvent): void {
    const {tenantId, registerSale} = event;
    this.updateInventory(tenantId, registerSale);
    if (registerSale.customerId) {
      this.updateCustomer(tenantId, registerSale)
    } else {
      this.sendPointRequest(tenantId, registerSale)
    }
  }

  /**
   * Sending point request message to Point app.
   */
  sendPointRequest(tenantId: string, sale: RegisterSale) {
    this.storeService.getStore(tenantId, sale.storeId)
      .then(store => {
        const enablePoints = this.customerService.calculateEarnableRewordPoints(sale.payments, store);
        posMessageBroker.sendMessage(tenantId, {
          saleId: sale.id,
          enablePoints
        });
      });
  }

  updateCustomer(tenantId: string, sale: RegisterSale) {
    Promise.all([this.storeService.getStore(tenantId, sale.storeId), this.customerService.getCustomer(tenantId, sale.customerId)])
      .then(([store, customer]) => {
        this.customerService.calculateCustomerValues(customer, sale.status, sale.payments, store);
        return this.customerService.updateCustomer(tenantId, customer);
      })
  }

  updateInventory(tenantId: string, sale: RegisterSale) {
    const productSums = this.sumProductQuantity(sale.lineItems);
    productSums.forEach(ps => {
      this.productService.getProduct(tenantId, ps.productId)
        .then(product => {
          if (product && product.trackInventory) {
            if (ps.quantity > 0) {
              this.inventoryService.decreaseCountBySale(tenantId, sale.storeId, sale.userId,
                sale.id, ps.productId, ps.quantity, ps.totalPrice);
            } else {
              // todo: return sale - increaseInventoryCount
            }
          }
        });
    });
  }

  /** returns total quantity for each product **/
  sumProductQuantity(lineItems: RegisterSaleLineItem[]) {
    const sum = [];
    lineItems.forEach(li => {
      const productSum = sum.find(s => s.productId === li.productId);
      if (productSum) {
        productSum.quantity += li.quantity;
        productSum.totalPrice += li.finalTotal;
      } else {
        sum.push({
          productId: li.productId,
          quantity: li.quantity,
          totalPrice: li.finalTotal
        });
      }
    });
    return sum;
  }

}
