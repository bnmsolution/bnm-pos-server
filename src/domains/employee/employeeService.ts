import {injectable, inject} from 'inversify';
import {Observable} from "rxjs/Observable";

const uuid = require('uuid/v1');

import {Employee, EmployeeRole, EmployeeType} from 'pos-models';
import {IStore} from '../../interfaces/store';
import SERVICE_IDENTIFIER from '../../constants/identifiers';

export interface IEmployeeService {
  getEmployees(tenantId: string): Promise<Array<Employee>>;

  getEmployee(tenantId: string, id: string): Promise<Employee>;

  createEmployee(tenantId: string, employee: Employee): Promise<Employee>;

  updateEmployee(tenantId: string, employee: Employee): Promise<Employee>;
}

@injectable()
export class EmployeeService implements IEmployeeService {

  @inject(SERVICE_IDENTIFIER.Store)
  private _store: IStore;

  getEmployees(tenantId: string): Promise<Employee[]> {
    throw new Error("Method not implemented.");
  }

  getEmployee(tenantId: string, id: string): Promise<Employee> {
    throw new Error("Method not implemented.");
  }

  async createEmployee(tenantId: string, employee: Employee): Promise<Employee> {

    // check a subscription for the maximum number of employees

    employee._id = `employee_${employee.id}`;
    return await this._store.insert(tenantId, employee, 'employee');
  }

  async updateEmployee(tenantId: string, employee: Employee): Promise<Employee> {
    return await this._store.update(tenantId, employee);
  }

  createMasterEmployee(tenantId: string, name: string, email: string, phone: string): Observable<any> {
    const masterUser: Employee = {
      id: uuid(),
      code: '0000',
      pinCode: '0000',
      type: EmployeeType.FullTime,
      role: EmployeeRole.Admin,
      name,
      email,
      phone,
      address: '',
      postalCode: '',
      note: '',
      dateOfBirth: null,
      dateOfJoin: null
    };
    return Observable.fromPromise(this.createEmployee(tenantId, masterUser));
  }

}
