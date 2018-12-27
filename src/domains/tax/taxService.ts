import {injectable, inject} from 'inversify';
import {Tax} from 'pos-models';
import {IStore} from '../../interfaces/store';
import SERVICE_IDENTIFIER from '../../constants/identifiers';
import {Observable} from "rxjs/Observable";

const uuid = require('uuid/v1');

export interface ITaxService {
  getTaxes(tenantId: string): Promise<Array<Tax>>;

  getTax(tenantId: string, id: string): Promise<Tax>;

  createTax(tenantId: string, register: Tax): Promise<Tax>;

  updateTax(tenantId: string, register: Tax): Promise<Tax>;
}

@injectable()
export class TaxService implements ITaxService {

  @inject(SERVICE_IDENTIFIER.Store)
  private _store: IStore;

  getTaxes(tenantId: string): Promise<Tax[]> {
    throw new Error("Method not implemented.");
  }

  getTax(tenantId: string, id: string): Promise<Tax> {
    throw new Error("Method not implemented.");
  }

  updateTax(tenantId: string, register: Tax): Promise<Tax> {
    throw new Error("Method not implemented.");
  }

  createTax(tenantId: string, tax: Tax): Promise<Tax> {
    return this._store.insert(tenantId, tax, 'tax');
  }

  addDefaultTax(tenantId: string): Observable<Tax> {
    const tax = {
      id: 'vat',
      name: '부가가치세',
      rate: 0.1
    };
    return Observable.fromPromise(this.createTax(tenantId, tax));
  }
}
