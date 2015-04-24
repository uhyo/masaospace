var domain = require('domain');
var config = require('config');
var logger = require('../logger');
var ticket_1 = require('./ticket');
var mum = require('my-user-mongo');
// 各種の操作
var Controller = (function () {
    function Controller(db) {
        this.db = db;
        //初期化
        this.user = mum.manager({
            db: db.mongo.getClient(),
            collection: {
                user: config.get("mongodb.collection.user")
            },
            user: {
                userIdLength: config.get("user.idLength")
            }
        });
        this.ticket = new ticket_1.default(db);
    }
    Controller.prototype.init = function (callback) {
        var _this = this;
        var d = domain.create();
        d.on("error", function (err) {
            callback(err);
        });
        this.user.init(d.intercept(function () {
            _this.initUser(d.intercept(function () {
                _this.ticket.init(function (err) {
                    callback(null);
                });
            }));
        }));
    };
    //ユーザー関連のコレクションの初期化
    Controller.prototype.initUser = function (callback) {
        var d = domain.create();
        d.on("error", function (err) {
            logger.critical(err);
            callback(err);
        });
        this.db.mongo.collection(config.get("mongodb.collection.user"), d.intercept(function (coll) {
            //インデックスを
            coll.createIndex({
                id: 1
            }, {
                unique: true
            }, d.intercept(function (result) {
                coll.createIndex({
                    "data.screen_name": 1
                }, {
                    unique: true
                }, d.intercept(function (result) {
                    callback(null);
                }));
            }));
        }));
    };
    Controller.prototype.getMongoClient = function () {
        return this.db.mongo.getClient();
    };
    Controller.prototype.getRedisClient = function () {
        return this.db.redis.getClient();
    };
    return Controller;
})();
module.exports = Controller;
