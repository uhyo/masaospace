///<reference path="./node.d.ts" />
// Web server
var config = require('config');
var express = require('express');
var WebServer = (function () {
    function WebServer() {
    }
    WebServer.prototype.init = function (callback) {
        //open web server
        this.app = express();
        this.route();
        this.app.listen(config.get("webserver.port"));
        process.nextTick(function () {
            callback(null);
        });
    };
    WebServer.prototype.route = function () {
    };
    return WebServer;
})();
exports.WebServer = WebServer;
