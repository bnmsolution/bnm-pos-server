import {injectable, inject} from 'inversify';
import {Category, createInventory, Product, Vendor} from 'pos-models';
import {IStore} from '../../interfaces/store';
import SERVICE_IDENTIFIER from '../../constants/identifiers';
import {IInventoryService} from '../inventory/inventoryService';

export interface IImportService {
  importProducts(tenantId: string, products: Product[]): Promise<any>;

  importCategories(tenantId: string, categories: Category[]): Promise<Category[]>;

  importVendors(tenantId: string, vendors: Vendor[]): Promise<Vendor[]>;
}

@injectable()
export class ImportService implements IImportService {

  @inject(SERVICE_IDENTIFIER.Store)
  private _store: IStore;
  @inject(SERVICE_IDENTIFIER.InventoryService)
  private _inventoryService: IInventoryService;

  importCategories(tenantId: string, categories: Category[]): Promise<Category[]> {
    return undefined;
  }

  importProducts(tenantId: string, products: Product[]): Promise<any> {
    return this.createBulkInventory(tenantId, products);
  }

  importVendors(tenantId: string, vendors: Vendor[]): Promise<Vendor[]> {
    return undefined;
  }

  /**
   * Creates bulk inventory triggered by importing products.
   * @param tenantId
   * @param products
   */
  private createBulkInventory(tenantId: string, products: Product[]): Promise<any> {
    const trackingProducts = products.filter(p => p.trackInventory);
    const inventories = [];
    const transactions = [];
    trackingProducts.forEach(p => {
      const {inventory, transaction} = this._inventoryService.createInventoryObjects(tenantId, p);
      inventories.push(inventory);
      transactions.push(transaction);
    });

    const promises = [this._store.bulkInsert(tenantId, products, 'product')];

    if (inventories.length) {
      promises.push(this._store.bulkInsert(tenantId, inventories, 'inventory'));
    }

    if (transactions.length) {
      promises.push(this._store.bulkInsert(tenantId, transactions, 'inventoryTransaction'));
    }

    return Promise.all(promises);
  }
}
