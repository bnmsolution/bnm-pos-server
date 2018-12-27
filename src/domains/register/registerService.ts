import { injectable, inject } from 'inversify';
import { Register } from 'pos-models';
import { IStore } from '../../interfaces/store';
import SERVICE_IDENTIFIER from '../../constants/identifiers';
import {Observable} from "rxjs/Observable";

export interface IRegisterService {
  getRegisters(tenantId: string): Promise<Array<Register>>;
  getRegister(tenantId: string, id: string): Promise<Register>;
  createRegister(tenantId: string, register: Register): Promise<Register>;
  updateRegister(tenantId: string, register: Register): Promise<Register>;
}

@injectable()
export class RegisterService implements IRegisterService {

  @inject(SERVICE_IDENTIFIER.Store)
  private _store: IStore;

  getRegisters(tenantId: string): Promise<Register[]> {
    throw new Error("Method not implemented.");
  }
  getRegister(tenantId: string, id: string): Promise<Register> {
    throw new Error("Method not implemented.");
  }

  async createRegister(tenantId: string, register: Register): Promise<Register> {
    // todo: check maximum number of register invariant
    // free: 1, basic 1, pro 3e

    return await this._store.insert(tenantId, register, 'register');
  }

  async updateRegister(tenantId: string, register: Register): Promise<Register> {
    return await this._store.update(tenantId, register).then(data => {
      return data;
    });
  }

  addDefaultRegister(tenantId: string): Observable<Register> {
    const register = new Register();
    register.name = '레지스터1';
    return Observable.fromPromise(this.createRegister(tenantId, register));
  }
}
