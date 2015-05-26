///<reference path="../node.d.ts" />
var domain = require('domain');
var logger = require('../logger');
var config = require('config');
var GameController = (function () {
    function GameController(db) {
        this.db = db;
    }
    GameController.prototype.init = function (callback) {
        var _this = this;
        var d = domain.create();
        d.on("error", function (err) {
            logger.critical(err);
            callback(err);
        });
        //indexes
        this.db.mongo.collection(config.get("mongodb.collection.gamematadata"), d.intercept(function (coll) {
            coll.createIndex({
                id: 1
            }, {
                unique: true
            }, d.intercept(function (result) {
                coll.createIndex({
                    owner: 1,
                    created: 1
                }, {}, d.intercept(function (result) {
                    coll.createIndex({
                        created: 1
                    }, {}, d.intercept(function (result) {
                        //gamedata index
                        _this.db.mongo.collection(config.get("mongodb.collection.gamedata"), d.intercept(function (coll) {
                            coll.createIndex({
                                id: 1
                            }, {
                                unique: 1
                            }, d.intercept(function (result) {
                                callback(null);
                            }));
                        }));
                    }));
                }));
            }));
        }));
    };
    return GameController;
})();
exports["default"] = GameController;
