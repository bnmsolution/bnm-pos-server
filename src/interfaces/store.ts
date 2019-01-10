import {Observable} from 'rxjs/Observable';

export interface IStore {
  listDatabases(): Promise<any>;

  doesDatabaseExist(tenantId: string): Observable<any>;

  createDatabase(tenantId: string): Observable<any>;

  get(tenantId: string, documentId: string): Promise<any>;

  getViewResult(tenantId: string, viewUrl: string, queryOptions: any): Promise<any>;

  insert(tenantId: string, document: any, documentName: string): Promise<any>;

  update(tenantId: string, document: any): Promise<any>;

  delete(tenantId: string, documentId: string, revision: string): Promise<any>;

  uniqid(numIds: number): Promise<any>;

  databaseName(tenantId: string): string;

  createUser(tenantId: string, email: string): Promise<any>;

  setDatabaseSecurity(tenantId: string, security: any): Promise<any>;

  bulkInsert(tenantId: string, docs: any[], documentName: string): Promise<any>;

  find(dbName: string, options: any): Promise<any>;
}
