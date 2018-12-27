import { injectable, inject } from 'inversify';
import { RegisterSale } from 'pos-models';
import { IStore } from '../../interfaces/store';
import SERVICE_IDENTIFIER from '../../constants/identifiers';
import { of } from 'rxjs/observable/of';

export interface IRegisterSaleService {
  getRegisterSales(tenantId: string): Promise<Array<RegisterSale>>;
  getRegisterSale(tenantId: string, id: string): Promise<RegisterSale>;
  createRegisterSale(tenantId: string, registerSale: RegisterSale): Promise<RegisterSale>;
  updateRegisterSale(tenantId: string, registerSale: RegisterSale): Promise<RegisterSale>;
}

@injectable()
export class RegisterSaleService implements IRegisterSaleService {

  @inject(SERVICE_IDENTIFIER.Store)
  private _store: IStore;

  getRegisterSales(tenantId: string): Promise<RegisterSale[]> {
    throw new Error("Method not implemented.");
  }
  getRegisterSale(tenantId: string, id: string): Promise<RegisterSale> {
    throw new Error("Method not implemented.");
  }

  async getRegisterSalesByTimeRange(tenantId: string, startTime: string, endTime: string): Promise<RegisterSale[]> {
    return this._store.getViewResult(tenantId, '_design/app/_view/sales_by_date_range', {
      startKey: startTime,
      endKey: endTime
    }).then(data => data.map(d => d.value));
  }

  async createRegisterSale(tenantId: string, registerSale: RegisterSale): Promise<RegisterSale> {
    this.removeReferences(registerSale);
    return await this._store.insert(tenantId, registerSale, 'registerSale');
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
