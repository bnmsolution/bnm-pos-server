
import { injectable, inject } from 'inversify';
import { Vendor } from 'pos-models';
import { IStore } from '../../interfaces/store';
import SERVICE_IDENTIFIER from '../../constants/identifiers';

export interface IVendorService {
  getVendors(tenantId: string): Promise<Array<Vendor>>;
  getVendor(tenantId: string, id: string): Promise<Vendor>;
  createVendor(tenantId: string, vendor: Vendor): Promise<Vendor>;
  updateVendor(tenantId: string, vendor: Vendor): Promise<Vendor>;
  deleteVendor(tenantId: string, id: string): Promise<Vendor>;
}

@injectable()
export class VendorService implements IVendorService {

  @inject(SERVICE_IDENTIFIER.Store)
  private _store: IStore;

  getVendors(tenantId: string): Promise<Vendor[]> {
    throw new Error("Method not implemented.");
  }
  async getVendor(tenantId: string, id: string): Promise<Vendor> {
    const documentId = `vendor_${id}`;
    return await this._store.get(tenantId, documentId);
  }

  async createVendor(tenantId: string, vendor: Vendor): Promise<Vendor> {
    return await this._store.insert(tenantId, vendor, 'vendor').then(data => {
      return data;
    });
  }

  async updateVendor(tenantId: string, vendor: Vendor): Promise<Vendor> {
    return await this._store.update(tenantId, vendor).then(data => {
      return data;
    });
  }

  async deleteVendor(tenantId: string, id: string): Promise<Vendor> {
    const documentId = `vendor_${id}`;
    return await this._store.get(tenantId, documentId)
      .then(vendor => {
        if(vendor) {
          return this._store.delete(tenantId, documentId, vendor._rev);
        } else {
          throw new Error(`Cannot find vendor ${id}`);
        }
      });
  }
}
