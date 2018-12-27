import {inject, injectable} from 'inversify';
import {createInventory, Inventory, InventoryTransaction, InventoryTransactionType, Product} from 'pos-models';
import {IStore} from '../../interfaces/store';
import SERVICE_IDENTIFIER from '../../constants/identifiers';

const uuid = require('uuid/v1');

export interface IInventoryService {
  getInventories(tenantId: string): Promise<Array<any>>;

  getInventory(tenantId: string, id: string): Promise<any>;

  createInventory(tenantId: string, product: Product): Promise<any>;

  createInventoryObjects(tenantId: string, product: Product): InventoryObject;

  activateInventory(tenantId: string, inventoryId: string): Promise<any>;

  deactivateInventory(tenantId: string, inventoryId: string): Promise<any>;
}

interface InventoryObject {
  inventory: Inventory;
  transaction: InventoryTransaction
}

@injectable()
export class InventoryService implements IInventoryService {

  @inject(SERVICE_IDENTIFIER.Store)
  private _store: IStore;

  getInventories(tenantId: string): Promise<any[]> {
    throw new Error("Method not implemented.");
  }

  getInventory(tenantId: string, id: string): Promise<any> {
    throw new Error("Method not implemented.");
  }

  async getInventoryByProductId(tenantId: string, productId: string): Promise<any> {
    return await this._store.get(tenantId, `inventory_${productId}`);
  }

  async createInventory(tenantId: string, product: Product): Promise<any> {
    const {inventory, transaction} = this.createInventoryObjects(tenantId, product);

    return await Promise.all([
      this._store.insert(tenantId, inventory, 'inventory'),
      this._store.insert(tenantId, transaction, 'inventoryTransaction')])
  }

  createInventoryObjects(tenantId: string, product: Product): InventoryObject {
    const inventory = createInventory(product);
    inventory._id = `inventory_${inventory.productId}`;
    const transactionId = `${inventory.productId}_${Date.now()}`;
    const transaction: InventoryTransaction = {
      _id: `inventoryTransaction_${transactionId}`,
      id: transactionId,
      quantity: inventory.count,
      unitCost: product.supplyPrice || 0,
      totalCost: product.supplyPrice * inventory.count,
      type: InventoryTransactionType.Initial
    };

    return {inventory, transaction};
  }

  async updateInventory(tenantId: string, inventory: any): Promise<any> {
    return await this._store.update(tenantId, inventory);
  }

  async activateInventory(tenantId: string, inventoryId: string): Promise<any> {

    throw new Error("Method not implemented.");
  }

  async deactivateInventory(tenantId: string, inventoryId: string): Promise<any> {
    throw new Error("Method not implemented.");
  }


  decreaseCountBySale(tenantId: string, storeId: string, userId: string, salesId: string,
                      productId: string, quantity: number, totalCost: number): Promise<any> {
    return this.getInventoryByProductId(tenantId, productId)
      .then(inventory => {
        if (inventory) {
          inventory.count -= quantity;
          const transactionId = `${inventory.productId}_${Date.now()}`;
          const transaction: InventoryTransaction = {
            _id: `inventoryTransaction_${transactionId}`,
            id: transactionId,
            quantity: quantity,
            totalCost,
            unitCost: totalCost / quantity,
            userId,
            salesId,
            type: InventoryTransactionType.Sold
          };
          return Promise.all([
            this.updateInventory(tenantId, inventory),
            this._store.insert(tenantId, transaction, 'inventoryTransaction')])
        }
      });
  }


}
