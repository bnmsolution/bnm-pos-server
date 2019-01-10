import {NodeCouch} from '../src/store/node-couch';

const couch = new NodeCouch({
  host: 'ec2-35-183-130-127.ca-central-1.compute.amazonaws.com',
  protocol: 'http',
  port: '5984',
  auth: {
    username: 'admin',
    password: 'admin'
  }
});

describe('NodeCouch test', () => {
  it('Should be able to get database list.', () => {
    return couch.listDatabases().then(dbs => {
      expect(dbs).not.toBe(null);
    });
  });

  it('Should be able to create database.', () => {
    return couch.createDatabase('test').then(dbs => {
      expect(dbs).not.toBe(null);
    });
  });

  it('Should be able to insert bulk docs.', () => {
    const docs = [{id: 1}, {id: 2}, {id: 3}];
    return couch.bulkDocs('test', docs).then(response => {
      console.log(response);
      expect(response).not.toBe(null);
    });
  });

  it('Should be able to read a doc.', () => {
    return couch.get('test', '5e205ce3a02ec2271e58c8917300047e').then(doc => {
      console.log(doc);
      expect(doc).not.toBe(null);
    });
  });

  it('Should be able to insert a doc.', () => {
    return couch.insert('test', {name: 'insert test'}).then(doc => {
      console.log(doc);
      expect(doc).not.toBe(null);
    });
  });

  it('Should be able to update a doc.', () => {
    return couch.update('test', {
      _id: '5e205ce3a02ec2271e58c8917300047e',
      _rev: '1-967a00dff5e02add41819138abb3284d',
      name: 'insert test'
    }).then(doc => {
      console.log(doc);
      expect(doc).not.toBe(null);
    });
  });

  it('Should be able to create a user.', () => {
    return couch.createUser({email: 'bill.jh.kim@gmail.com', tenantId: 'test'}).then(doc => {
      console.log(doc);
      expect(doc).not.toBe(null);
    });
  });

  it('Should be able to set security.', () => {
    return couch.setDatabaseSecurity('test', {
      admins: {
        names: ['admin', 'admin2'],
        roles: ['admin', 'manager']
      },
      members: {
        names: ['member1', 'member2'],
        roles: ['staff', 'manager']
      }
    }).then(doc => {
      console.log(doc);
      expect(doc).not.toBe(null);
    });
  });

  it('test.', () => {
    return couch.find('db-dd695360-fe7b-11e8-be96-83393183a7cb', {
      selector: {
        phone: {
          $eq: '011-1234-3333'
        }
      }
    }).then(doc => {
      console.log(doc);
    }, err => {
      console.log(err);
    });
  });


});
