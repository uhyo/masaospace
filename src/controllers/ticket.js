///<reference path="../node.d.ts" />
var randomString = require('random-string');
var config = require('config');
var logger = require('../logger');
//ticket controller
var TicketController = (function () {
    function TicketController(db) {
        this.db = db;
    }
    TicketController.prototype.init = function (callback) {
        //init dbs
        this.getCollection(function (err, coll) {
            if (err) {
                callback(err);
                return;
            }
            //ensure ticket index
            coll.createIndex({
                token: 1
            }, {
                unique: true
            }, function (err, result) {
                if (err) {
                    logger.critical(err);
                    callback(err);
                    return;
                }
                //TODO: it should check existing index to update ttl time
                coll.createIndex({
                    created: 1
                }, {
                    expireAfterSeconds: config.get("ticket.life.setpassword")
                }, function (err, result) {
                    if (err) {
                        logger.critical(err);
                    }
                    callback(err);
                    return;
                });
            });
        });
    };
    //新しいticketを発行
    TicketController.prototype.newTicket = function (t, callback) {
        if (!this.checkTicket(t)) {
            logger.error("Invalid ticket " + JSON.stringify(t));
            callback("Invalid ticket", null);
            return;
        }
        this.getCollection(function (err, coll) {
            if (err) {
                callback(err, null);
                return;
            }
            //まずticket tokenを決定
            decideToken();
            function decideToken() {
                var token = randomString({ length: config.get("ticket.length") });
                coll.count({ token: token }, function (err, count) {
                    if (err) {
                        logger.error(err);
                        callback(err, null);
                        return;
                    }
                    //万が一重複したら再考
                    if (count > 0) {
                        decideToken();
                        return;
                    }
                    //重複なしを確認したら（これ以降はuniqueで止める）
                    var ti = {
                        token: token,
                        type: t.type,
                        user: t.user,
                        created: new Date()
                    };
                    coll.insertOne(ti, function (err, result) {
                        if (err) {
                            logger.error(err);
                            callback(err, null);
                            return;
                        }
                        //成功した
                        callback(null, ti);
                    });
                });
            }
        });
    };
    //チケットがあるか調べる
    TicketController.prototype.findTicket = function (token, callback) {
        this.getCollection(function (err, coll) {
            if (err) {
                callback(err, null);
                return;
            }
            coll.findOne({ token: token }, function (err, doc) {
                if (err) {
                    logger.error(err);
                    return;
                }
                callback(null, doc || null);
            });
        });
    };
    //チケットを消す
    TicketController.prototype.removeTicket = function (token, callback) {
        this.getCollection(function (err, coll) {
            if (err) {
                callback(err);
                return;
            }
            coll.deleteOne({ token: token }, function (err, result) {
                if (err) {
                    logger.error(err);
                    return;
                }
                callback(null);
            });
        });
    };
    //コレクションを得る
    TicketController.prototype.getCollection = function (callback) {
        this.db.mongo.collection(config.get("mongodb.collection.ticket"), function (err, col) {
            if (err) {
                logger.critical(err);
                callback(err, null);
            }
            callback(null, col);
        });
    };
    //Ticketがvalidかどうかチェック
    TicketController.prototype.checkTicket = function (t) {
        //type check
        if (t.type !== "setpassword") {
            //undefined ticket type
            return false;
        }
        return true;
    };
    return TicketController;
})();
exports.default = TicketController;
