"use strict";
exports.__esModule = true;
var axios_1 = require("axios");
var NodeCouch = /** @class */ (function () {
    function NodeCouch(opts) {
        if (opts === void 0) { opts = {}; }
        var instanceOpts = Object.assign({
            protocol: 'http',
            host: '127.0.0.1',
            port: 5984,
            timeout: 5000,
            auth: null
        }, opts);
        this.axiosInstance = axios_1["default"].create({
            baseURL: instanceOpts.protocol + "://" + instanceOpts.host + ":" + instanceOpts.port + "/",
            timeout: 5000,
            headers: {
                'Accept': 'application/json',
                'Content-type': 'application/json'
            },
            auth: instanceOpts.auth
        });
        this.axiosInstance.interceptors.response.use(function (response) {
            // Do something with response data
            return response;
        }, function (error) {
            // Do something with response error
            console.log(error);
            return Promise.reject(error);
        });
    }
    NodeCouch.prototype.bulkDocs = function (dbName, docs) {
        return undefined;
    };
    NodeCouch.prototype.createDatabase = function (dbName) {
        return undefined;
    };
    NodeCouch.prototype.dropDatabase = function (dbName) {
        return undefined;
    };
    NodeCouch.prototype.get = function (dbName, docId) {
        return undefined;
    };
    NodeCouch.prototype.listDatabases = function () {
        return this.axiosInstance.get('_all_dbs');
    };
    return NodeCouch;
}());
exports.NodeCouch = NodeCouch;
