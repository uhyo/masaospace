///<reference path="./node.d.ts" />
var domain = require('domain');
var logger = require('./logger');
var db = require('./db');
var web = require('./web');
var Controller = require('./controllers/index');
var System = (function () {
    function System() {
        this.db = new db.DBAccess();
        this.srv = new web.WebServer();
        this.c = new Controller(this.db);
    }
    System.prototype.init = function (callback) {
        var _this = this;
        logger.info("System is preparing.");
        var d = domain.create();
        d.on("error", function (err) {
            logger.emergency(err);
            d.removeAllListeners("error");
            callback(err);
        });
        //connect DB
        this.db.connect(d.intercept(function () {
            _this.c.init(d.intercept(function () {
                //web server
                _this.srv.init(_this.db, d.intercept(function () {
                    logger.info("System is ready.");
                    callback(null);
                }));
            }));
        }));
    };
    return System;
})();
exports.System = System;
