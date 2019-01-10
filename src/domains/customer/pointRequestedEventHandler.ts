import { inject } from 'inversify';
import { PointConfirmRequest } from 'pos-models';

import SERVICE_IDENTIFIER from '../../constants/identifiers';
import { CustomerService } from './customerService';
import { EventHandler } from '../../shared/eventHandler';
import { EventBase } from '../../shared/event';
import { PosMessageBroker } from '../../posMessageBroker';

declare const posMessageBroker: PosMessageBroker;

export class PointRequestedEvent implements EventBase {
  constructor(public tenantId: string, public saleId: string, public customerPhoneNumber: string, public enablePoints: number) {
  }
}

export class PointRequestedEventHandler extends EventHandler {

  @inject(SERVICE_IDENTIFIER.CustomerService)
  private customerService: CustomerService;

  handle(event: PointRequestedEvent) {
    this.isNewCustomer(event);
  }

  isNewCustomer({ tenantId, saleId, customerPhoneNumber, enablePoints }: PointRequestedEvent) {
    this.customerService.findCustomerByPhoneNumber(tenantId, customerPhoneNumber)
      .then(customer => {
        if (customer) {
          // send message to pos
          posMessageBroker.sendMessageToPos(tenantId, new PointConfirmRequest(saleId, null, customer.id, enablePoints));
        } else {
          // check confirm
          posMessageBroker.sendMessageToPos(tenantId, {
            customerPhoneNumber,
            enablePoints
          });
        }
      });
  }
}