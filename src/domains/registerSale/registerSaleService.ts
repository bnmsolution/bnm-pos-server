import { injectable, inject } from 'inversify';
import { RegisterSale } from 'pos-models';
import { IStore } from '../../interfaces/store';
import SERVICE_IDENTIFIER from '../../constants/identifiers';
import { of } from 'rxjs/observable/of';
import { CustomerService } from '../customer/customerService';
import { StoreService } from '../store/storeService';

export interface IRegisterSaleService {
  getRegisterSales(tenantId: string): Promise<Array<RegisterSale>>;
  getRegisterSale(tenantId: string, saleId: string): Promise<RegisterSale>;
  createRegisterSale(tenantId: string, registerSale: RegisterSale): Promise<RegisterSale>;
  updateRegisterSale(tenantId: string, registerSale: RegisterSale): Promise<RegisterSale>;
}

@injectable()
export class RegisterSaleService implements IRegisterSaleService {

  @inject(SERVICE_IDENTIFIER.Store)
  private _store: IStore;

  @inject(SERVICE_IDENTIFIER.CustomerService)
  private customerService: CustomerService;

  @inject(SERVICE_IDENTIFIER.StoreService)
  private storeService: StoreService;

  getRegisterSales(tenantId: string): Promise<RegisterSale[]> {
    throw new Error("Method not implemented.");
  }

  async getRegisterSale(tenantId: string, saleId: string): Promise<RegisterSale> {
    return await this._store.get(tenantId, `registerSale_${saleId}`);
  }

  async getRegisterSalesByTimeRange(tenantId: string, startTime: string, endTime: string): Promise<RegisterSale[]> {
    return this._store.getViewResult(tenantId, '_design/app/_view/sales_by_date_range', {
      startKey: startTime,
      endKey: endTime
    }).then(data => data.map(d => d.value));
  }

  async createRegisterSale(tenantId: string, registerSale: RegisterSale): Promise<RegisterSale> {
    this.removeReferences(registerSale);

    if (registerSale.customer) {
      /**
           * Customer points and stats are calculated RegisterSaleClosedEvent handler but
           * we need to send earned points and customer's total points back to client for printing a receipt.
           */
      return Promise.all([
        this.storeService.getStore(tenantId, registerSale.storeId),
        this.customerService.getCustomer(tenantId, registerSale.customerId)])
        .then(([store, customer]) => {
          registerSale.pointsEarned = store.useReward ? this.customerService.calculateEarnableRewordPoints(registerSale.payments, store) : 0;
          registerSale.totalCustomerPoint = customer.totalStorePoint + registerSale.pointsEarned;
          return this._store.insert(tenantId, registerSale, 'registerSale');
        });
    } else {
      return this._store.insert(tenantId, registerSale, 'registerSale');
    }
  }

  async updateRegisterSale(tenantId: string, registerSale: RegisterSale): Promise<RegisterSale> {
    this.removeReferences(registerSale);
    return await this._store.update(tenantId, registerSale);
  }

  private removeReferences(registerSale: RegisterSale) {
    const { customer, employee } = registerSale;
    if (customer) {
      registerSale.customerId = customer.id;
    }

    if (employee) {
      registerSale.employeeId = employee.id;
    }
    delete registerSale.customer;
    delete registerSale.employee;
  }
}
