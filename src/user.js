//User control
var UserControl = (function () {
    function UserControl(dbaccess) {
        this.access = new UserAccess(dbaccess);
    }
    //login
    UserControl.prototype.login = function (userid, password, callback) {
        var _this = this;
        this.access.loadUser({
            userid: userid
        }, function (error, user) {
            if (error) {
                callback(error, null);
                return;
            }
            if (user == null) {
                callback(null, {
                    login: false,
                    session: null,
                    error: error.user.Login.AUTH_FAILS
                });
                return;
            }
            //パスワードを確かめる
            if (!user.auth(password)) {
                //パスワードが一致しない
                callback(null, {
                    login: false,
                    session: null,
                    error: error.user.Login.AUTH_FAILS
                });
                return;
            }
            //パスワードが一致したのでログイン成功
            //セッション作成
            var session = _this.access.createSession({
                userid: user.userid,
                name: user.name
            });
            _this.access.saveSession(session, function (error) {
                if (error) {
                    callback(error, null);
                    return;
                }
                callback(null, {
                    login: true,
                    session: session,
                    error: null
                });
            });
        });
    };
    return UserControl;
})();
exports.UserControl = UserControl;
//User db access
var UserAccess = (function () {
    function UserAccess(dbaccess) {
        this.dbaccess = dbaccess;
    }
    //user may be null
    UserAccess.prototype.loadUser = function (query, callback) {
        var dbquery = {};
        if (query._id != null) {
            dbquery._id = query._id;
        }
        else if (query.userid != null) {
            dbquery.userid = query.userid;
        }
        else {
            callback(new Error("invalid LoadUserQuery."), null);
            return;
        }
        this.dbaccess.mongo.collection(this.dbaccess.mongo.C_users, function (error, coll) {
            if (error) {
                callback(error, null);
                return;
            }
            coll.findOne(dbquery, function (error, doc) {
                if (error) {
                    callback(error, null);
                    return;
                }
                if (doc == null) {
                    callback(null, null);
                }
                else {
                    var result = new User();
                    result.initFromDoc(doc);
                    callback(null, result);
                }
            });
        });
    };
    //session load/save
    UserAccess.prototype.loadSession = function (sessionid, callback) {
        var c = this.dbaccess.redis.getClient();
        c.hgetall(sessionid + ":session", function (error, result) {
            if (error) {
                callback(error, null);
            }
            else {
                callback(null, {
                    sessionid: sessionid,
                    userid: result.userid,
                    name: result.name,
                    login_time: new Date(Number(result.login_time)),
                    last_time: new Date(Number(result.last_time))
                });
            }
        });
    };
    UserAccess.prototype.saveSession = function (session, callback) {
        var c = this.dbaccess.redis.getClient();
        c.hmset(session.sessionid + ":session", {
            userid: session.userid,
            name: session.name,
            login_time: String(session.login_time.getTime()),
            last_time: String(session.last_time.getTime())
        }, callback);
    };
    //session create
    UserAccess.prototype.createSession = function (obj) {
        var now = new Date();
        var sessionid = crypto.pseudoRandomBytes(16).toString("hex");
        return {
            sessionid: sessionid,
            userid: obj.userid,
            name: obj.name,
            login_time: now,
            last_time: now
        };
    };
    return UserAccess;
})();
exports.UserAccess = UserAccess;
