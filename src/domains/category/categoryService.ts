
import { injectable, inject } from 'inversify';
import { Category } from 'pos-models';
import { IStore } from '../../interfaces/store';
import SERVICE_IDENTIFIER from '../../constants/identifiers';

export interface ICategoryService {
  getCategories(tenantId: string): Promise<Array<Category>>;
  getCategory(tenantId: string, id: string): Promise<Category>;
  createCategory(tenantId: string, category: Category): Promise<Category>;
  updateCategory(tenantId: string, category: Category): Promise<Category>;
  deleteCategory(tenantId: string, id: string): Promise<Category>;
}

@injectable()
export class CategoryService implements ICategoryService {

  @inject(SERVICE_IDENTIFIER.Store)
  private _store: IStore;

  getCategories(tenantId: string): Promise<Category[]> {
    throw new Error("Method not implemented.");
  }

  async getCategory(tenantId: string, id: string): Promise<Category> {
    const documentId = `category_${id}`;
    return await this._store.get(tenantId, documentId);
  }

  async createCategory(tenantId: string, category: Category): Promise<Category> {
    return await this._store.insert(tenantId, category, 'category').then(data => {
      return data;
    });
  }

  async updateCategory(tenantId: string, category: Category): Promise<Category> {
    return await this._store.update(tenantId, category).then(data => {
      return data;
    });
  }

  async deleteCategory(tenantId: string, id: string): Promise<Category> {
    const documentId = `category_${id}`;
    return await this._store.get(tenantId, documentId)
      .then(category => {
        if (category) {
          return this._store.delete(tenantId, documentId, category._rev);
        } else {
          throw new Error(`Cannot find category ${id}`);
        }
      });
  }
}
