///<reference path="../node.d.ts" />
// file uploading module
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var mime = require('mime');
var config = require('config');
var logger = require('../logger');
var util_1 = require('../util');
var FileController = (function () {
    function FileController(db) {
        this.db = db;
    }
    FileController.prototype.init = function (callback) {
        var _this = this;
        //first make directory to store files
        mkdirp(path.resolve(__dirname, "../../config", config.get("file.path")), function (err) {
            if (err) {
                logger.critical(err);
                callback(err);
                return;
            }
            //next prepare databases
            _this.db.mongo.collection(config.get("mongo.collection.file"), function (err, coll) {
                if (err) {
                    callback(err);
                    return;
                }
                coll.createIndex({
                    id: 1
                }, {
                    unique: true
                }, function (err, result) {
                    if (err) {
                        logger.critical(err);
                        callback(err);
                        return;
                    }
                    coll.createIndex({
                        owner: 1
                    }, {}, function (err, result) {
                        if (err) {
                            logger.critical(err);
                            callback(err);
                            return;
                        }
                        callback(null);
                    });
                });
            });
        });
    };
    FileController.prototype.addFile = function (f, filepath, callback) {
        //add file to db
        this.db.mongo.collection(config.get("mongo.collection.file"), function (err, coll) {
            if (err) {
                callback(err, null);
                return;
            }
            var baseid = util_1.uniqueToken(config.get("file.idLength"));
            //新しいファイル名をつくる
            var id = baseid + "." + mime.extension(fi.type);
            var fi = {
                id: id,
                type: f.type,
                owner: f.owner,
                name: f.name,
                created: f.created
            };
            //directory to place file
            var dir = path.join(config.get("file.path"), fi.owner);
            mkdirp(dir, function (err) {
                if (err) {
                    logger.error(err);
                    //入力ファイルの処理を試みる
                    fs.unlink(filepath, function (err2) {
                        if (err2) {
                            logger.error(err2);
                            callback(err2, null);
                            return;
                        }
                        callback(err, null);
                    });
                    return;
                }
                fs.rename(filepath, path.join(dir, id), function (err) {
                    if (err) {
                        logger.error(err);
                        fs.unlink(filepath, function (err2) {
                            if (err2) {
                                logger.error(err2);
                                callback(err2, null);
                                return;
                            }
                            callback(err, null);
                        });
                        return;
                    }
                    coll.insertOne(fi, function (err, result) {
                        if (err) {
                            logger.error(err);
                            callback(err, null);
                            return;
                        }
                        //入った
                        callback(null, fi);
                    });
                });
            });
        });
    };
    FileController.prototype.getFiles = function (q, callback) {
        this.db.mongo.collection(config.get("mongo.collection.file"), function (err, coll) {
            if (err) {
                callback(err, null);
                return;
            }
            coll.find(q).toArray(function (err, docs) {
                if (err) {
                    logger.error(err);
                    callback(err, []);
                    return;
                }
                callback(null, docs);
            });
        });
    };
    return FileController;
})();
exports.default = FileController;
