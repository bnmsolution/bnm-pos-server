import {injectable, inject} from 'inversify';
import {Observable} from "rxjs/Observable";
import {PosStore, PriceAdjustmentType} from 'pos-models';

const uuid = require('uuid/v1');

import {IStore} from '../../interfaces/store';
import SERVICE_IDENTIFIER from '../../constants/identifiers';

export interface IStoreService {
  createDefaultStore(tenantId: string, storeName: string, defaultTaxId: string): Observable<any>;
  getStore(tenantId: string, storeId: string): Promise<PosStore>;
}

@injectable()
export class StoreService implements IStoreService {

  @inject(SERVICE_IDENTIFIER.Store)
  private _store: IStore;

  createDefaultStore(tenantId: string, storeName: string, defaultTaxId: string): Observable<any> {
    const defaultStore:PosStore = {
      id: uuid(),
      name: storeName,
      locale: 'ko',
      currencyCode: 'KRW',
      displayCurrencySymbol: false,
      defaultTaxId,
      totalPriceAdjust: PriceAdjustmentType.Drop10,
      includeTaxInRetailPrice: true,
      dateFormat: 'YYYY-MM-DD A hh:mm:ss',
      dateFormatShort: '',
      useReward: false,
      rewardRateForCash: 0,
      rewardRateForCredit: 0,
      minimumPointsToUse: 0
    };

    return Observable.fromPromise(this.createStore(tenantId, defaultStore));
  }

  async getStore(tenantId: string, storeId: string): Promise<PosStore> {
    const documentId = `store_${storeId}`;
    return await this._store.get(tenantId, documentId);
  }


  async createStore(tenantId: string, store: PosStore): Promise<PosStore> {
    return await this._store.insert(tenantId, store, 'store').then(data => {
      return data;
    });
  }

  async updateStore(tenantId: string, store: PosStore): Promise<PosStore> {
    return await this._store.update(tenantId, store).then(data => {
      return data;
    });
  }

}
