var logger = require('../logger');
//User auth&session
var b;
var C = (function () {
    function C() {
    }
    C.prototype.route = function (router, c) {
        // 新規ユーザー登録
        router.post("/entry", function (req, res) {
            //バリデーション
            req.checkBody("screen_name", "ユーザーID").isUserID();
            req.checkBody("name", "ユーザー名").isUserName();
            req.checkBody("mail", "メールアドレス").isEmail();
            if (req.validationErrors()) {
                res.json({
                    error: String(req.validationErrors())
                });
                return;
            }
            //screen_nameの重複をチェック
            //新しいユーザーデータを作る
            var data = {
                activated: false,
                screen_name: req.body.screen_name,
                screen_name_lower: req.body.screen_name.toLowerCase(),
                name: req.body.name,
                mail: req.body.mail,
                created: new Date()
            };
            //既存のユーザーとの重複をチェック
            c.user.user.findOneUser({
                screen_name_lower: data.screen_name_lower
            }, function (err, user) {
                if (err) {
                    throw err;
                }
                if (user != null) {
                    //ユーザーすでに存在
                    res.json({
                        error: "そのユーザーIDは使用されています。"
                    });
                    return;
                }
                //ユーザーを登録
                c.user.entry(data, function (err, result) {
                    if (err) {
                        logger.error(err);
                        res.json({
                            error: String(err)
                        });
                        return;
                    }
                    var u = result.user;
                    //登録完了。チケットを発行
                    c.ticket.newTicket({
                        type: "setpassword",
                        user: u.id
                    }, function (err, t) {
                        if (err) {
                            res.json({
                                error: String(err)
                            });
                            return;
                        }
                        //user entry success
                        res.json({
                            screen_name: u.getData().screen_name,
                            ticket: t.token
                        });
                    });
                });
            });
        });
    };
    return C;
})();
module.exports = C;
