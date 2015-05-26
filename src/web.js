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
var st = require('st');
var ect = require('ect');
var logger = require('./logger');
var validator = require('./validator');
var WebServer = (function () {
    function WebServer() {
    }
    WebServer.prototype.init = function (c, callback) {
        //open web server
        this.app = express();
        //rendering engine
        var views = path.resolve(__dirname, "..", "client", "views");
        var ectRenderer = ect({
            root: views,
            ext: ".ect"
        });
        this.app.set("views", views);
        this.app.set("view engine", "ect");
        this.app.engine("ect", ectRenderer.render);
        // bodyparser
        this.app.use(bodyParser.urlencoded({
            extended: false
        }));
        //static files
        this.app.use(st({
            path: path.resolve(__dirname, "..", "client", "static"),
            url: "/static",
            index: false
        }));
        //validator
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
        this.front(c);
        this.app.listen(config.get("webserver.port"));
        process.nextTick(function () {
            callback(null);
        });
    };
    //route apis
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
                        var subroute = express.Router();
                        router.use("/" + files[i], subroute);
                        (new mod).route(subroute, c);
                    }
                }
            }
        }
    };
    //front pages
    WebServer.prototype.front = function (c) {
        // TODO
        this.app.get("/", function (req, res) {
            res.render("index.ect", {
                title: "foo",
                content: "<p>bar</p>"
            });
        });
    };
    return WebServer;
})();
exports.WebServer = WebServer;
