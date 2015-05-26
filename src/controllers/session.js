///<reference path="../node.d.ts" />
var logger = require('../logger');
var SessionController = (function () {
    function SessionController(db, user) {
        this.db = db;
        this.user = user;
    }
    SessionController.prototype.init = function (callback) {
        callback(null);
    };
    //ユーザーがログインを試みる
    SessionController.prototype.login = function (session, u, password, callback) {
        //trueならログイン成功
        var query = {}, flag = false;
        if (u.screen_name_lower != null) {
            query["data.screen_name_lower"] = u.screen_name_lower;
            flag = true;
        }
        if (u.mail != null) {
            query["data.mail"] = u.mail;
            flag = true;
        }
        if (flag === false) {
            logger.warning("Invalid login query");
            callback("Invalid login query", false);
            return;
        }
        this.user.user.findOneUser(query, function (err, u) {
            if (err) {
                logger.error(err);
                callback(err, false);
                return;
            }
            if (u == null) {
                // no such user
                callback(null, false);
                return;
            }
            //got user
            var result = u.auth(password);
            if (result === false) {
                //login fails
                callback(null, false);
                return;
            }
            var d = u.getData();
            //succeed!
            session.user = u.id;
            session.screen_name = d.screen_name;
            session.name = d.name;
            session.save(function (err) {
                if (err) {
                    logger.error(err);
                    callback(null, false);
                    return;
                }
                callback(null, true);
            });
        });
    };
    SessionController.prototype.logout = function (session, callback) {
        //log out!!!!!!!!!
        session.user = null;
        session.screen_name = null;
        session.name = null;
        session.save(function (err) {
            if (err) {
                logger.error(err);
            }
            callback(err);
        });
    };
    return SessionController;
})();
exports["default"] = SessionController;
