import {injectable, inject} from 'inversify';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/switchMap';
import {switchMap, filter} from 'rxjs/operators';

const uuid = require('uuid/v1');
const request = require('request');

import {AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_DOMAIN, AUTH0_MANAGEMENT_IDENTIFIER} from '../constants/configs';
import SERVICE_IDENTIFIER from '../constants/identifiers';
import {IStore} from '../interfaces/store';
import {Customer, RetailerType} from '../models/customer';
import {RegisterService} from "../domains/register/registerService";
import {TaxService} from "../domains/tax/taxService";
import {EmployeeService} from "../domains/employee/employeeService";
import {StoreService} from "../domains/store/storeService";

interface AuthManagementToken {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

export interface IAuthService {

}

@injectable()
export class Auth implements IAuthService {
  @inject(SERVICE_IDENTIFIER.Store)
  private _store: IStore;

  @inject(SERVICE_IDENTIFIER.RegisterService)
  private _registerService: RegisterService;

  @inject(SERVICE_IDENTIFIER.TaxService)
  private _taxService: TaxService;

  @inject(SERVICE_IDENTIFIER.EmployeeService)
  private _employeeService: EmployeeService;

  @inject(SERVICE_IDENTIFIER.StoreService)
  private _storeService: StoreService;

  private _token: AuthManagementToken;

  /**
   * Gets a management token for Auth0 api.
   * @returns {Promise<string>}
   */
  getManagementToken(): Promise<string> {
    console.log(`Getting management token`);

    const options = {
      method: 'POST',
      url: `https://${AUTH0_DOMAIN}/oauth/token`,
      headers: {'content-type': 'application/json'},
      body:
        {
          grant_type: 'client_credentials',
          client_id: AUTH0_CLIENT_ID,
          client_secret: AUTH0_CLIENT_SECRET,
          audience: AUTH0_MANAGEMENT_IDENTIFIER
        },
      json: true
    };

    return new Promise((resolve, reject) => {
      request(options, (error, response, body) => {
        if (error) {
          reject(error);
        }
        console.log(`token: ${body}`);
        this._token = body;
        resolve();
      });
    });
  }

  private _sendGetRequest(resource: string) {
    const options = {
      method: 'GET',
      url: `https://${AUTH0_DOMAIN}/api/v2/${resource}`,
      headers:
        {
          authorization: `Bearer ${this._token.access_token}`,
          'content-type': 'application/json'
        }
    };
  }

  /**
   * Sends a post request to Auth0 endpoint.
   * @param {string} resource
   * @param data
   * @returns {Promise<any>}
   * @private
   */
  private _sendPostRequest(resource: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getManagementToken()
        .then(() => {
          const options = {
            method: 'POST',
            url: `https://bmsolution.auth0.com/api/v2/${resource}`,
            headers:
              {
                authorization: `Bearer ${this._token.access_token}`
              },
            json: true,
            body: data
          };

          console.log(`send request to ${options.url}`);

          request(options, (error, response, body) => {
            console.log(body);
            if (error) {
              reject(error);
            }
            resolve(body);
          });
        });
    });
  }

  /**
   * 1. Generates a unique tenantId.
   * 2. Creates an auth0 user.
   * 3. Creates tenant database.
   * 4. Inserts the defualt data
   */

  createUser(userInfo): Promise<any> {
    const tenantId = uuid();
    userInfo.tenantId = tenantId;

    return this._createAuth0User(userInfo)
      .switchMap(response => {
        if (response.hasOwnProperty('error')) {
          // let's throw error and kill the stream
          throw new Error('Duplicated email.');
        } else {
          return this._initTenantDatabase(tenantId, userInfo.email);
        }
      })
      .switchMap(() => this._addCustomer(userInfo))
      .switchMap(() => this._addInitialData(userInfo))
      .toPromise();
  }

  private _initTenantDatabase(tenantId: string, email: string) {
    const dbSecurity = {
      admins: {
        names: [],
        roles: []
      },
      members: {
        names: [email],
        roles: []
      }
    };
    return this._store.createDatabase(tenantId)
      .pipe(
        switchMap(() => this._store.createUser(tenantId, email)),
        switchMap(() => this._store.setDatabaseSecurity(tenantId, dbSecurity))
      )
  }

  private _addCustomer({tenantId, retailerType, numberOfStores, storeName, webAddress, name, email, phone}): Observable<any> {
    const customer = new Customer(tenantId, retailerType, numberOfStores, storeName, webAddress, name, email, phone);
    return Observable.fromPromise(this._store.insert('customer', customer, 'customer'));
  }

  private _createAuth0User({email, password, tenantId, webAddress}): Observable<any> {
    const request = this._sendPostRequest('users', {
      connection: 'Username-Password-Authentication',
      name: email,
      email,
      password: password,
      email_verified: false,
      verify_email: false,
      app_metadata: {
        tenantId,
        webAddress
      }
    });
    return Observable.fromPromise(request);
  }

  private _deleteAuth0User(email: string): Observable<any> {
    throw 'not implemented';
  }

  private _addInitialData({tenantId, storeName, name, email, phone}): Observable<any> {
    return this._registerService.addDefaultRegister(tenantId)
      .switchMap(() => this._employeeService.createMasterEmployee(tenantId, name, email, phone))
      .switchMap(() => this._taxService.addDefaultTax(tenantId))
      .switchMap(tax => {
        return this._storeService.createDefaultStore(tenantId, storeName, tax.id);
      })
  }
}
