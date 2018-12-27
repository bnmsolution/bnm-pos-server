import * as express from 'express';
import { injectable, inject } from 'inversify';

import SERVICE_IDENTIFIER from '../../constants/identifiers';
import { EmployeeService } from './employeeService';
import { RegistrableController } from '../../interfaces/registerableController';

@injectable()
export class EmployeeController implements RegistrableController {
  private _employeeService: EmployeeService;

  constructor( @inject(SERVICE_IDENTIFIER.EmployeeService) employeeService: EmployeeService) {
    this._employeeService = employeeService;
  }

  public register(app: express.Application): void {
    app.route('/api/employee')
      .get(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        res.json({ status: true });
      })
      .post(async (req: any, res: express.Response, next: express.NextFunction) => {
        const createdEmployee = await this._employeeService.createEmployee(req.user.tenantId, req.body)
          .catch(err => next(err));
        res.json(createdEmployee);
      })
      .put(async (req: any, res: express.Response, next: express.NextFunction) => {
        const updateEmployee = await this._employeeService.updateEmployee(req.user.tenantId, req.body)
          .catch(err => next(err));
        res.json(updateEmployee);
      })
  }
}
