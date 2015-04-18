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
        this.user.init(function (err) {
            if (err) {
                logger.emergency(err);
                callback(err);
                return;
            }
            _this.ticket.init(function (err) {
                callback(null);
            });
        });
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
