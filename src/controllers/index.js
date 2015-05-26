var domain = require('domain');
var config = require('config');
var logger = require('../logger');
var ticket_1 = require('./ticket');
var file_1 = require('./file');
var session_1 = require('./session');
var game_1 = require('./game');
var mum = require('my-user-mongo');
// 各種の操作
var Controller = (function () {
    function Controller(db) {
        this.db = db;
    }
    Controller.prototype.init = function (callback) {
        var _this = this;
        var db = this.db;
        var d = domain.create();
        d.on("error", function (err) {
            callback(err);
        });
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
        this.ticket = new ticket_1["default"](db);
        this.file = new file_1["default"](db);
        this.session = new session_1["default"](db, this.user);
        this.game = new game_1["default"](db);
        logger.debug("Controller: initialization start.");
        this.user.init(d.intercept(function () {
            _this.initUser(d.intercept(function () {
                logger.debug("Controller.user initialized.");
                _this.ticket.init(d.intercept(function () {
                    logger.debug("Controller.ticket initialized.");
                    _this.session.init(d.intercept(function () {
                        logger.debug("Controller.session initialized.");
                        _this.game.init(d.intercept(function () {
                            logger.debug("Controller.game initialized.");
                            callback(null);
                        }));
                    }));
                }));
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
                    "data.screen_name_lower": 1
                }, {
                    unique: true
                }, d.intercept(function (result) {
                    coll.createIndex({
                        "data.mail": 1
                    }, {
                        unique: true
                    }, d.intercept(function (result) {
                        callback(null);
                    }));
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
