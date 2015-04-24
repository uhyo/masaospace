var path = require('path');
var mkdirp = require('mkdirp');
var config = require('config');
var logger = require('../logger');
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
    return FileController;
})();
exports.default = FileController;
