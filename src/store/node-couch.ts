import axios, {AxiosInstance} from 'axios';

interface DocumentCreatedResponse {
  id: string;
  ok: boolean;
  rev: string;
}

interface DocumentUpdatedResponse {
  id: string;
  ok: boolean;
  rev: string;
}

export class NodeCouch {
  axiosInstance: AxiosInstance;

  constructor(configs) {
    this.axiosInstance = axios.create({
      baseURL: `${configs.protocol}://${configs.host}:${configs.port}/`,
      timeout: 5000,
      headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json'
      },
      auth: configs.auth
    });
    //
    // this.axiosInstance.interceptors.response.use(response => {
    //   // Do something with response data
    //   return response.data;
    // }, error => {
    //   // Do something with response error
    //   console.log(error);
    //   return Promise.reject(error);
    // });
  }

  bulkDocs(dbName: string, docs: any[]): Promise<any> {
    return this.axiosInstance.post(`${dbName}/_bulk_docs`, {docs})
      .then(response => {
        return response.data;
      })
      .catch(error => {
        return error.response.data
      })
  }

  createDatabase(dbName: string): Promise<any> {
    return this.axiosInstance.put(dbName)
      .then(response => {
        return response.data;
      })
      .catch(error => {
        console.log(error);
        return error.response.data
      })
  }

  dropDatabase(dbName: string): Promise<any> {
    return undefined;
  }

  find(dbName: string, options: any = {}): Promise<any> {
    return this.axiosInstance.post(`${dbName}/_find`, options)
      .then(response => {
        return response.data.docs;
      })
      .catch(error => {
        return error.response.data
      })
  }

  get(dbName: string, docId: string): Promise<any> {
    return this.axiosInstance.get(`${dbName}/${docId}`)
      .then(response => {
        return response.data;
      })
      .catch(error => {
        return error.response.data
      })
  }

  getViewResult(): Promise<any> {
    throw new Error('Not implemented');
  }

  insert(dbName: string, doc: any): Promise<DocumentCreatedResponse> {
    return this.axiosInstance.post(dbName, doc)
      .then(response => {
        return response.data;
      })
      .catch(error => {
        return error.response.data
      })
  }

  update(dbName: string, doc: any): Promise<DocumentUpdatedResponse> {
    return this.axiosInstance.put(`${dbName}/${doc._id}`, doc)
      .then(response => {
        return response.data;
      })
      .catch(error => {
        return error.response.data
      })
  }

  delete(dbName: string, docId: string, rev: string): Promise<DocumentUpdatedResponse> {
    return this.axiosInstance.delete(`${dbName}/${docId}?rev=${rev}`)
    .then(response => {
      return response.data;
    })
    .catch(error => {
      return error.response.data
    })
  }

  createUser(user): Promise<any> {
    console.log('create user');
    console.log(user);
    return this.axiosInstance.put(`_users/org.couchdb.user:${user.name}`, {
      name: user.name,
      password: user.password,
      roles: [],
      type: 'user'
    })
      .then(response => {
        return response.data;
      })
      .catch(error => {
        return error.response.data;
      })
  }

  setDatabaseSecurity(dbName: string, security: any): Promise<any> {
    return this.axiosInstance.put(`${dbName}/_security`, security)
      .then(response => {
        return response.data;
      })
      .catch(error => {
        return error.response.data;
      })
  }

  listDatabases(): Promise<any> {
    return this.axiosInstance.get('_all_dbs')
  }
}