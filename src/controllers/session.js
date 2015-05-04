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
    SessionController.prototype.login = function (u, password, callback) {
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
            callback(null, u.auth(password));
        });
    };
    return SessionController;
})();
exports.default = SessionController;
