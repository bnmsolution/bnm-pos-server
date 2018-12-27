"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
var inversify_1 = require("inversify");
var NodeCouchDb = require("node-couchdb");
var Observable_1 = require("rxjs/Observable");
require("rxjs/add/observable/fromPromise");
var CouchDb = /** @class */ (function () {
    function CouchDb() {
        this._couch = new NodeCouchDb({
            host: process.env.COUCH_HOST || '13.124.188.143',
            protocol: process.env.COUCH_PROTOCOL || 'http',
            port: process.env.COUCH_PORT || '5984',
            auth: {
                user: 'admin',
                pass: 'admin'
            }
        });
        this.listDatabases();
    }
    CouchDb.prototype.listDatabases = function () {
        return this._couch.listDatabases();
    };
    CouchDb.prototype.createDatabase = function (tenantId) {
        var _this = this;
        var dbname = this.databaseName(tenantId);
        var promise = this._couch.createDatabase(dbname)
            .then(function () {
            console.log("Database " + dbname + " was created.");
            _this.addFilters(dbname);
            return true;
        }, function (err) {
            console.log('db create error');
            console.log(err);
            return false;
        });
        return Observable_1.Observable.fromPromise(promise);
    };
    /**
     * Checks if a database exists.
     * @param databaseName
     */
    CouchDb.prototype.doesDatabaseExist = function (tenantId) {
        var _this = this;
        return Observable_1.Observable.fromPromise(this.listDatabases()
            .then(function (dbs) { return dbs.indexOf(_this.databaseName(tenantId)) > -1; }));
    };
    CouchDb.prototype.get = function (tenantId, documentId) {
        return this._couch.get(this.databaseName(tenantId), documentId)
            .then(function (_a) {
            var data = _a.data;
            console.log(data);
            return data;
        }, function (err) {
            console.log(err);
            return err;
        });
    };
    CouchDb.prototype.getViewResult = function (tenantId, viewUrl, queryOptions) {
        if (queryOptions === void 0) { queryOptions = {}; }
        return this._couch.get(this.databaseName(tenantId), viewUrl, queryOptions)
            .then(function (_a) {
            var data = _a.data;
            return data.rows;
        });
    };
    CouchDb.prototype.insert = function (tenantId, document) {
        document.created = new Date();
        // for the one-way(remote to local) replication filter
        document.fromRemote = true;
        return this._couch.insert(this.databaseName(tenantId), document)
            .then(function (_a) {
            var data = _a.data;
            // data is json response
            // headers is an object with all response headers
            // status is statusCode number
            document._id = data.id;
            console.log(data);
            return data;
        }, function (err) {
            // either request error occured
            console.log(err);
            return err;
        });
    };
    CouchDb.prototype.update = function (tenantId, document) {
        var _this = this;
        document.fromRemote = true;
        // always update document from the latest revision
        return this.get(tenantId, document._id)
            .then(function (doc) {
            document._rev = doc._rev;
            return _this._update(tenantId, document);
        });
    };
    CouchDb.prototype._update = function (tenantId, document) {
        return this._couch.update(this.databaseName(tenantId), document)
            .then(function (_a) {
            var data = _a.data;
            console.log(data);
            return data;
        }, function (err) {
            return err;
        });
    };
    CouchDb.prototype["delete"] = function (tenantId, documentId, revision) {
        return this._couch.del(this.databaseName(tenantId), documentId, revision)
            .then(function (_a) {
            var data = _a.data;
            return data;
        }, function (err) {
            return err;
        });
    };
    CouchDb.prototype.uniqid = function (numIds) {
        throw new Error('Method not implemented.');
    };
    CouchDb.prototype.databaseName = function (tenantId) {
        return "db-" + tenantId;
    };
    /**
     * Adding filters.
     * @param {string} dbname
     */
    CouchDb.prototype.addFilters = function (dbname) {
        var replicationFilter = {
            _id: '_design/app',
            filters: {
                remoteOnly: function (doc) {
                    return doc.fromRemote;
                }.toString()
            }
        };
        this._couch.insert(dbname, replicationFilter)
            .then(function (_a) {
            var data = _a.data;
            console.log(data);
        }, function (err) {
            console.log(err);
        });
    };
    CouchDb = __decorate([
        inversify_1.injectable()
    ], CouchDb);
    return CouchDb;
}());
exports.CouchDb = CouchDb;
