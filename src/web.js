///<reference path="./node.d.ts" />
// Web server
var config = require('config');
var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var connectRedis = require('connect-redis');
var csurf = require('csurf');
var logger = require('./logger');
var validator = require('./validator');
var WebServer = (function () {
    function WebServer() {
    }
    WebServer.prototype.init = function (c, callback) {
        //open web server
        this.app = express();
        this.app.use(bodyParser.urlencoded({
            extended: false
        }));
        this.app.use(validator.makeExpressValidator());
        //session
        var sessoption = {
            secret: config.get("session.secret"),
            resave: false,
            saveUninitialized: false,
            cookie: {
                secure: config.get("webserver.secure")
            },
            store: new (connectRedis(expressSession))({
                client: c.getRedisClient(),
                ttl: config.get("session.life"),
                db: config.get("redis.db"),
                prefix: "sess:"
            })
        };
        this.app.use(expressSession(sessoption));
        this.app.use(csurf());
        //error handling
        this.app.use(function (err, req, res, next) {
            if (req.xhr) {
                //JSON error response
                logger.error(err);
                res.status(500).json({ error: String(err) });
            }
            else {
                //normal error response
                res.status(500).send(String(err));
            }
        });
        this.route(c);
        this.app.listen(config.get("webserver.port"));
        process.nextTick(function () {
            callback(null);
        });
    };
    WebServer.prototype.route = function (c) {
        var t = this;
        var apiroot = express.Router();
        // api/を全部読み込む
        var apipath = path.resolve(__dirname, "api");
        readDir(apipath, apiroot);
        this.app.use("/api", apiroot);
        function readDir(dirpath, router) {
            //ディレクトリを読む
            var files = fs.readdirSync(dirpath);
            for (var i = 0; i < files.length; i++) {
                var filepath = path.resolve(dirpath, files[i]);
                var st = fs.statSync(filepath);
                if (st.isDirectory()) {
                    //open subdirectory
                    var subroute = router.route(files[i]);
                    readDir(filepath, subroute);
                }
                else if (path.extname(files[i]) === ".js") {
                    //js file
                    var mod = require(filepath);
                    if ("function" === typeof mod) {
                        var subroute = router.route(files[i]);
                        (new mod).route(subroute, c);
                    }
                }
            }
        }
    };
    return WebServer;
})();
exports.WebServer = WebServer;
