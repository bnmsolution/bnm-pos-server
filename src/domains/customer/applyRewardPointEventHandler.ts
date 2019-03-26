import { inject } from 'inversify';
import { Customer, RegisterSale } from 'pos-models';

import SERVICE_IDENTIFIER from '../../constants/identifiers';
import { CustomerService } from './customerService';
import { EventHandler } from '../../shared/eventHandler';
import { EventBase } from '../../shared/event';
import { PosMessageBroker } from '../../posMessageBroker';
import { RegisterSaleService } from '../registerSale/registerSaleService';
import { StoreService } from '../store/storeService';

declare const posMessageBroker: PosMessageBroker;

export class ApplyRewardPointEvent implements EventBase {
  constructor(public tenantId: string, public saleId: string, public customerId: string,
    public isNewCustomer: boolean, public pointsEarned: number) {
  }
}

export class ApplyRewardPointEventHandler extends EventHandler {

  @inject(SERVICE_IDENTIFIER.CustomerService)
  private customerService: CustomerService;

  @inject(SERVICE_IDENTIFIER.RegisterSaleService)
  private registerSaleService: RegisterSaleService;

  @inject(SERVICE_IDENTIFIER.StoreService)
  private storeService: StoreService;

  handle(event: ApplyRewardPointEvent) {
    this.registerSaleService.getRegisterSale(event.tenantId, event.saleId)
      .then(registerSale => {
        this.updateRegisterSale(event.tenantId, registerSale, event.customerId, event.isNewCustomer, event.pointsEarned);
        this.updateCustomer(event.tenantId, registerSale);
      }, error => {
        // todo: handle error(persisting error)
      });

    // update customer values
  }


  /**
   * Updates customer and points to register sale.
   *
   * @param tenantId
   * @param registerSale
   * @param customerId
   * @param isNewCustomer
   * @param pointsEarned
   */
  private updateRegisterSale(tenantId: string, registerSale: RegisterSale, customerId: string, isNewCustomer: boolean, pointsEarned: number) {
    registerSale.customerId = customerId;
    registerSale.isNewCustomer = isNewCustomer;
    registerSale.pointsEarned = pointsEarned;
    this.registerSaleService.updateRegisterSale(tenantId, registerSale);
  }

  private updateCustomer(tenantId: string, sale: RegisterSale) {
    Promise.all([this.storeService.getStore(tenantId, sale.storeId), this.customerService.getCustomer(tenantId, sale.customerId)])
      .then(([store, customer]) => {
        this.customerService.calculateCustomerValues(customer, sale, store);
        return this.customerService.updateCustomer(tenantId, customer);
      })
      .then(customer => {
        this.sendConfirmMessageToPos(tenantId, sale.id, customer);
      })
  }

  private sendConfirmMessageToPos(tenantId:string, saleId: string, customer: Customer) {
    posMessageBroker.sendMessageToPos(tenantId, {
      saleId,
      customer
    });
  }
}