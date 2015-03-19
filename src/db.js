///<reference path="./node.d.ts" />
var mongodb = require('mongodb');
var redis = require('redis');
var mum = require('my-user-mongo');
var config = require('config');
var logger = require('./logger');
exports.Collection = mongodb.Collection;
exports.ObjectId = mongodb.ObjectId;
//DBアクセス
var DBAccess = (function () {
    function DBAccess() {
        this.mongo = new Mongo();
        this.redis = new Redis();
    }
    DBAccess.prototype.connect = function (callback) {
        var _this = this;
        this.mongo.connect(function (err) {
            if (err) {
                callback(err);
                return;
            }
            _this.redis.connect(function (err) {
                if (err) {
                    callback(err);
                    return;
                }
                //init my-user-mongo
                _this.user = mum.manager({
                    db: _this.mongo.getClient(),
                    collection: {
                        user: config.get("mongodb.collection.user")
                    },
                    user: {
                        userIdLength: config.get("user.idLength")
                    }
                });
                _this.user.init(function (err) {
                    if (err) {
                        logger.emergency(err);
                        callback(err);
                        return;
                    }
                    callback(null);
                });
            });
        });
    };
    return DBAccess;
})();
exports.DBAccess = DBAccess;
var Mongo = (function () {
    function Mongo() {
        this.connected = false;
    }
    Mongo.prototype.connect = function (callback) {
        var _this = this;
        if (this.connected === true) {
            //既に接続されている感
            process.nextTick(function () {
                callback(null);
            });
            return;
        }
        mongodb.MongoClient.connect("mongodb://" + config.get("mongodb.user") + ":" + config.get("mongodb.password") + "@" + config.get("mongodb.host") + ":" + config.get("mongodb.port") + "/" + config.get("mongodb.db"), {
            db: {
                w: "majority"
            }
        }, function (error, db) {
            if (error) {
                callback(error);
                return;
            }
            _this.db = db;
            _this.connected = true;
            callback(null);
        });
    };
    Mongo.prototype.getClient = function () {
        return this.db;
    };
    Mongo.prototype.collection = function (name, callback) {
        if (this.connected !== true || !this.db) {
            callback(new Error("Not connected to DB."), null);
            return;
        }
        this.db.collection(name, callback);
    };
    return Mongo;
})();
exports.Mongo = Mongo;
var Redis = (function () {
    function Redis() {
        this.connected = false;
    }
    Redis.prototype.connect = function (callback) {
        var _this = this;
        if (this.connected === true) {
            //既に接続されている感
            callback(null);
            return;
        }
        this.client = redis.createClient(config.get("redis.port"), config.get("redis.host"));
        this.client.select(config.get("redis.db"), function (error, result) {
            _this.connected = true;
            callback(error);
        });
    };
    Redis.prototype.getClient = function () {
        return this.client;
    };
    return Redis;
})();
exports.Redis = Redis;
