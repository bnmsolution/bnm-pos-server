import {injectable} from 'inversify';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';

import {COUCH_HOST, COUCH_ADMIN_PASSWORD, COUCH_ADMIN_USER, COUCH_PORT, COUCH_PROTOCOL} from '../constants/configs';
import {IStore} from '../interfaces/store';
import {Entity} from '../models/entity';
import {NodeCouch} from './node-couch';

@injectable()
export class CouchDb implements IStore {

  private _couch: NodeCouch;

  constructor() {
    const configs = {
      host: COUCH_HOST,
      protocol: COUCH_PROTOCOL,
      port: COUCH_PORT,
      auth: {
        username: COUCH_ADMIN_USER,
        password: COUCH_ADMIN_PASSWORD
      }
    };
    // this._couch = new NodeCouchDb(configs);
    this._couch = new NodeCouch(configs);
  }

  listDatabases(): Promise<any> {
    return this._couch.listDatabases();
  }

  createDatabase(tenantId: string): Observable<boolean> {
    const dbName = this.databaseName(tenantId);
    const promise = this._couch.createDatabase(dbName)
      .then(() => {
        console.log(`Database ${dbName} was created.`);
        this.addFilters(dbName);
        return true;
      }, err => {
        console.log('db create error');
        console.log(err);
        return false;
      });

    return Observable.fromPromise(promise);
  }

  createUser(tenantId: string, email: string): Promise<any> {
    return this._couch.createUser({name: email, password: tenantId});
  }

  setDatabaseSecurity(tenantId: string, security: any): Promise<any> {
    return this._couch.setDatabaseSecurity(this.databaseName(tenantId), security);
  }

  /**
   * Checks if a database exists.
   * @param databaseName
   */
  doesDatabaseExist(tenantId: string): Observable<boolean> {
    return Observable.fromPromise(this.listDatabases()
      .then(dbs => dbs.indexOf(this.databaseName(tenantId)) > -1));
  }

  find(tenantId: string, options: any = {}): Promise<any> {
    return this._couch.find(this.databaseName(tenantId), options);
  }

  get(tenantId: string, documentId: string): Promise<any> {
    return this._couch.get(this.databaseName(tenantId), documentId)
      .then((doc) => {
        return doc;
      }, err => {
        console.log(err);
        return err;
      });
  }

  getViewResult(tenantId: string, viewUrl: string, queryOptions: any = {}): Promise<any> {
    // return this._couch.get(this.databaseName(tenantId), viewUrl, queryOptions)
    //   .then(({data}) => data.rows);
    throw new Error('Method not implemented.');
  }

  insert(tenantId: string, document: Entity, documentName: string): Promise<any> {
    document._id = `${documentName}_${document.id}`;
    document.created = new Date();
    // for the one-way(remote to local) replication filter
    document.fromRemote = true;
    return this._couch.insert(this.databaseName(tenantId), document)
      .then((doc) => {
        // data is json response
        // headers is an object with all response headers
        // status is statusCode number
        console.log(`[DB] Document ${document._id} created`);
        document._rev = doc.rev;
        return document;
      }, err => {
        // either request error occured
        console.group(`[ERROR] Couchdb insert ERROR. TenantId: ${tenantId}`);
        console.error(document);
        console.error(err.stack);
        console.groupEnd();
        throw new Error('Couchdb insert ERROR')
      });
  }

  bulkInsert(tenantId: string, docs: any[], documentName: string): Promise<any> {
    docs.forEach(d => {
      d._id = `${documentName}_${d.id}`;
      d.created = new Date();
      d.fromRemote = true;
    });
    return this._couch.bulkDocs(this.databaseName(tenantId), docs);
  }

  update(tenantId: string, document: any): Promise<any> {
    document.fromRemote = true;

    // always update document from the latest revision
    return this.get(tenantId, document._id)
      .then(doc => {
        document._rev = doc._rev;
        return this._update(tenantId, document)
      });
  }

  _update(tenantId: string, document: any): Promise<any> {
    return this._couch.update(this.databaseName(tenantId), document)
      .then(response => {
        document._rev = response.rev;
        return document;
      }, err => {
        return err;
      });
  }

  delete(tenantId: string, documentId: string, revision: string): Promise<any> {
    return this._couch.delete(this.databaseName(tenantId), documentId, revision)
      .then(response => {
        return response;
      }, err => {
        return err;
      });
  }

  uniqid(numIds: number): Promise<any> {
    throw new Error('Method not implemented.');
  }

  databaseName(tenantId: string): string {
    return `db-${tenantId}`;
  }

  /**
   * Adding filters.
   * @param {string} dbname
   */
  addFilters(dbname: string) {
    const replicationFilter = {
      _id: '_design/app',
      filters: {
        remoteOnly: function (doc) {
          return doc.fromRemote;
        }.toString()
      }
    };
    this._couch.insert(dbname, replicationFilter)
      .then((response) => {
        console.log(response);
      }, err => {
        console.log(err);
      });
  }
}
