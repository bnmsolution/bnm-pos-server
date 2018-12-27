import * as express from 'express';
import { injectable, inject } from 'inversify';

import SERVICE_IDENTIFIER from '../../constants/identifiers';
import { CategoryService } from './categoryService';
import { RegistrableController } from '../../interfaces/registerableController';

@injectable()
export class CategoryController implements RegistrableController {
  private _categoryService: CategoryService;

  constructor( @inject(SERVICE_IDENTIFIER.CategoryService) categoryService: CategoryService) {
    this._categoryService = categoryService;
  }

  public register(app: express.Application): void {
    app.route('/api/category')
      .get(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        res.json({ status: true });
      })
      .post(async (req: any, res: express.Response, next: express.NextFunction) => {
        const createdCategory = await this._categoryService.createCategory(req.user.tenantId, req.body)
          .catch(err => next(err));
        res.json(createdCategory);
      })
      .put(async (req: any, res: express.Response, next: express.NextFunction) => {
        const updateCategory = await this._categoryService.updateCategory(req.user.tenantId, req.body)
          .catch(err => next(err));
        res.json(updateCategory);
      });

    app.route('/api/category/:id')
      .delete(async (req: any, res: express.Response, next: express.NextFunction) => {
        const deletedCategory = await this._categoryService.deleteCategory(req.user.tenantId, req.params.id)
          .catch(err => next(err));
        res.json(deletedCategory);
      });
  }
}
