import {injectable, inject} from 'inversify';
import {Product} from 'pos-models';
import {IStore} from '../../interfaces/store';
import SERVICE_IDENTIFIER from '../../constants/identifiers';

export interface IProductService {
  getProducts(tenantId: string): Promise<Array<Product>>;

  getProduct(tenantId: string, id: string): Promise<Product>;

  createProduct(tenantId: string, product: Product): Promise<Product>;

  updateProduct(tenantId: string, product: Product): Promise<Product>;

  activateProduct(tenantId: string, productId: string): Promise<Product>;

  deactivateProduct(tenantId: string, productId: string): Promise<Product>;
}

@injectable()
export class ProductService implements IProductService {


  @inject(SERVICE_IDENTIFIER.Store)
  private _store: IStore;

  getProducts(tenantId: string): Promise<Product[]> {
    throw new Error("Method not implemented.");
  }

  async getProduct(tenantId: string, id: string): Promise<Product> {
    return await this._store.get(tenantId, `product_${id}`);
  }

  async createProduct(tenantId: string, product: Product): Promise<Product> {

    // check unique sku invariant

    // check unique barcode invariant

    // check a subscription for the maximum number of products


    return await this._store.insert(tenantId, product, 'product');
  }

  async updateProduct(tenantId: string, product: Product): Promise<Product> {

    // check unique sku invariant

    // check unique barcode invariant

    return await this._store.update(tenantId, product).then(data => {
      return data;
    });
  }

  async activateProduct(tenantId: string, productId: string): Promise<Product> {

    // check a subscription for the maximum number of products

    throw new Error("Method not implemented.");
  }

  async deactivateProduct(tenantId: string, productId: string): Promise<Product> {
    throw new Error("Method not implemented.");
  }
}
