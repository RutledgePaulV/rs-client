'use strict';

var Promise = require('promise');
var request = require('request');

class CachingClient {

    
    constructor(base) {
        this.base = base;
        this.cache = {};
    }

    _get(uri, params) {
        var url = this._url(uri);
        var key = CachingClient._key('GET', uri, params);
        var that = this;

        return new Promise(function (resolve, reject) {

            if (that.cache.hasOwnProperty(key)) {
                resolve(that.cache[key]);
            }

            request({url: url, qs: params}, function (err, response, body) {

                if (err) {
                    reject(err);
                } else {
                    if (body) {
                        var result = that.cache[key] = JSON.parse(body);
                        resolve(result);
                    } else {
                        console.log("You've been rate limited! Settle down cowboy!");
                        resolve({});
                    }
                }
            });

        });
    }

    _url(uri) {
        return CachingClient._join(this.base, uri);
    }

    static _key() {
        return JSON.stringify(Array.prototype.slice.call(arguments));
    }

    static _join() {
        return Array.prototype.slice.call(arguments)
            .map(item => item.toString())
            .reduce((pre, cur) => pre + cur, '');
    }

}


module.exports = CachingClient;