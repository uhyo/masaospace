import * as express from 'express';
import * as typeis from 'type-is';
import Controller from '../controllers/index';

import * as logger from '../logger';

import * as config from 'config';

import * as util from '../util';

import { User, UserData, UserOneQuery, Session } from '../data';
import { UserData as MUserData } from 'my-user-mongo';

//User auth&session
export default class C {
  route(router: express.Router, c: Controller): void {
    // 自分の情報
    router.post('/mydata', util.apim.useUser, (req, res) => {
      c.user.user.findOneUser(
        {
          id: req.session!.user,
        },
        (err, user) => {
          if (err) {
            res.json({
              error: String(err),
            });
            return;
          }
          if (user == null) {
            logger.warning(
              'Session for non-existent user: ' + req.session!.user,
            );
            res.json({
              error: 'そのユーザーは存在しません。',
            });
            return;
          }
          //ユーザーの情報をあげるけど……
          const data = {
            ...user.getData(),
            id: user.id,
          };
          res.json({
            data,
          });
        },
      );
    });
    // 新規ユーザー登録
    router.post('/entry', (req, res) => {
      //バリデーション
      req.validateBody('screen_name').isUserID();
      req.validateBody('name').isUserName();
      req.validateBody('mail').isEmail();

      if (req.validationErrorResponse(res)) {
        return;
      }

      //screen_nameの重複をチェック
      //新しいユーザーデータを作る
      var data: UserData = {
        activated: false,
        screen_name: req.body.screen_name,
        screen_name_lower: req.body.screen_name.toLowerCase(),
        name: req.body.name,
        mail: req.body.mail,
        profile: '',
        icon: null,
        url: '',

        created: new Date(),
      };
      //既存のユーザーとの重複をチェック
      c.user.user.findOneUser(
        {
          $or: [
            {
              'data.screen_name_lower': data.screen_name_lower,
            },
            {
              'data.mail': data.mail,
            },
          ],
        },
        (err, user) => {
          if (err) {
            throw err;
          }
          if (user != null) {
            //ユーザーすでに存在
            let d = user.getData();
            if (d.screen_name_lower === data.screen_name_lower) {
              res.json({
                error: 'そのユーザーIDは使用されています。',
              });
            } else {
              res.json({
                error: 'そのメールアドレスは既に登録されています。',
              });
            }
            return;
          }
          //ユーザーを登録
          c.user.entry(data, (err, result) => {
            if (err || result == null) {
              logger.error(err);
              res.json({
                error: String(err),
              });
              return;
            }
            let u: User<MUserData<UserData>> = result.user;
            //登録完了。チケットを発行
            c.ticket.newTicket(
              {
                type: 'setpassword',
                //FIXME
                user: u.id!,
              },
              (err, t) => {
                if (err || t == null) {
                  res.json({
                    error: String(err),
                  });
                  return;
                }
                //メールを送信する
                c.mail.userEntryMail(u, t.token);
                //user entry success
                const ud = u.getData();
                res.json({
                  screen_name: ud.screen_name,
                  mail: ud.mail,
                });
              },
            );
          });
        },
      );
    });
    //チケットチェック
    router.post('/ticket/check', (req, res) => {
      var token: string = req.body.token;
      //トークンを探してあげる
      c.ticket.findTicket(token, (err, t) => {
        if (err) {
          res.json({
            error: String(err),
          });
          return;
        }
        if (t == null) {
          //チケットがなかった
          res.json({
            ticket: false,
          });
          return;
        }
        //あった
        res.json({
          ticket: true,
          type: t.type,
        });
      });
    });
    //パスワード設定
    router.post('/entry/setpassword', (req, res) => {
      var token: string = req.body.token,
        screen_name: string = req.body.screen_name;

      req.validateBody('password').isPassword();
      if (req.validationErrorResponse(res)) {
        return;
      }

      var password: string = req.body.password;
      //トークンを探して
      c.ticket.findTicket(token, (err, t) => {
        if (err) {
          res.json({
            error: String(err),
          });
          return;
        }
        if (t == null) {
          //不正なトークンでは
          res.json({
            error: 'トークンが不正です。',
          });
          return;
        }
        //ユーザーも探して
        c.user.user.findOneUser(
          {
            id: t.user,
          },
          (err, u) => {
            if (err || u == null) {
              logger.error(err);
              res.json({
                error: String(err),
              });
              return;
            }
            //screen_name一致チェック
            const data: MUserData<UserData> = u.getData();
            if (data.screen_name !== screen_name) {
              res.json({
                error: 'screen_nameが一致しません。',
              });
              return;
            }
            //パスワードをセット
            u.setData(data, password);
            //activate
            u.writeData({
              activated: true,
            });
            //セーブ
            c.user.user.saveUser(u, err => {
              if (err) {
                logger.error(err);
                res.json({
                  error: String(err),
                });
                return;
              }
              //成功した
              res.json({
                success: true,
              });
              c.ticket.removeTicket(token, err => {
                if (err) {
                  logger.error(err);
                }
              });
            });
          },
        );
      });
    });
    //パスワードリセット
    //IN: id_or_mail:string
    //OUT: success:boolean
    router.post('/entry/reset', (req, res) => {
      var id: string = req.body.id_or_mail;
      var uq: any;
      if ('string' !== typeof id) {
        id = '';
      }
      if (id.indexOf('@') >= 0) {
        //mail addressっぽい
        uq = {
          'data.mail': id,
        };
      } else {
        uq = {
          'data.screen_name_lower': id.toLowerCase(),
        };
      }
      c.user.user.findOneUser(uq, (err, user) => {
        if (err) {
          logger.error(err);
          res.json({
            error: String(err),
          });
          return;
        }
        if (user == null) {
          res.json({
            error: 'ユーザーが見つかりませんでした。',
          });
          return;
        }
        //パスワード再発行チケットを発行
        c.ticket.newTicket(
          {
            type: 'resetpassword',
            // FIXME
            user: user.id!,
          },
          (err, t) => {
            if (err || t == null) {
              res.json({
                error: String(err),
              });
              return;
            }
            //チケットを発行した。メールを送る
            c.mail.resetPasswordMail(user, t.token);
            //success
            res.json({
              success: true,
            });
          },
        );
      });
    });
    //ユーザー情報
    router.post('/update', util.apim.useUser, (req, res) => {
      req.validateBody('name').isUserName();
      req.validateBody('profile').isUserProfile();
      req.validateBody('url').isUserURL();

      if (req.validationErrorResponse(res)) {
        return;
      }

      //ユーザー情報をupdateする
      c.user.user.findOneUser(
        {
          id: req.session!.user,
        },
        (err, user) => {
          if (err) {
            throw err;
          }
          if (user == null) {
            res.json({
              error: 'ログインしていません。',
            });
            return;
          }
          //iconがある場合は自分のアイコンか確認する
          (!req.body.icon
            ? (callback: Cont) => {
                callback(null);
              }
            : (callback: Cont) => {
                c.file.getFiles(
                  {
                    id: req.body.icon,
                    owner: req.session!.user,
                  },
                  (err, files) => {
                    if (err || files == null) {
                      throw err;
                    }
                    if (files.length === 0) {
                      throw 'アイコンのファイルが存在しません。';
                    }
                    var file = files[0];
                    //typeをチェック
                    if (!typeis.is(file.type, ['image/*'])) {
                      throw 'アイコンファイルが画像ではありません。';
                    }
                    //OK!
                    callback(null);
                  },
                );
              })(err => {
            if (err) {
              throw err;
            }
            user.writeData({
              name: req.body.name,
              profile: req.body.profile,
              icon: req.body.icon || null,
              url: req.body.url,
            });
            c.user.user.saveUser(user, err => {
              if (err) {
                logger.error(err);
                throw err;
              }
              req.session!.name = req.body.name;
              req.session!.profile = req.body.profile;
              req.session!.icon = req.body.icon || null;
              req.session!.url = req.body.url;
              req.session!.save(err => {
                if (err) {
                  throw err;
                }
                res.json(
                  util.writeUserInfo(req.session! as Session, {
                    success: true,
                  }),
                );
              });
            });
          });
        },
      );
    });
    router.post('/changepassword', util.apim.useUser, (req, res) => {
      req.validateBody('oldpassword').isPassword();
      req.validateBody('newpassword').isPassword();
      if (req.validationErrorResponse(res)) {
        return;
      }
      c.user.user.findOneUser(
        {
          id: req.session!.user,
        },
        (err, u) => {
          if (err || u == null) {
            logger.error(err);
            res.json({
              error: String(err),
            });
            return;
          }
          //古いパスワードをチェック
          var r = u.auth(req.body.oldpassword);
          if (r !== true) {
            res.json({
              error: '現在のパスワードが間違っています。',
            });
            return;
          }
          //新しいパスワードをセット
          u.setData(u.getData(), req.body.newpassword);
          c.user.user.saveUser(u, err => {
            if (err) {
              logger.error(err);
              res.json({
                error: String(err),
              });
              return;
            }
            //成功した
            res.json({
              success: true,
            });
          });
        },
      );
    });
    router.post('/changemail', util.apim.useUser, (req, res) => {
      req.validateBody('mail').isEmail();
      if (req.validationErrorResponse(res)) {
        return;
      }

      c.user.user.findOneUser(
        {
          id: req.session!.user,
          'data.activated': true,
        },
        (err, u) => {
          if (err) {
            logger.error(err);
            res.json({
              error: err,
            });
            return;
          }
          if (u == null) {
            //?????
            logger.warning(
              'Session for non-existent user: ' + req.session!.user,
            );
            res.json({
              error: 'ログインしていません？',
            });
            return;
          }
          //メールアドレス変更チケットを発行
          c.ticket.newTicket(
            {
              type: 'setmail',
              user: req.session!.user,
              data: req.body.mail,
            },
            (err, t) => {
              if (err || t == null) {
                res.json({
                  error: String(err),
                });
                return;
              }
              //メールを送信する
              c.mail.changeMailMail(u, req.body.mail, t.token);
              res.json({
                success: true,
              });
            },
          );
        },
      );
    });
    //発行したticketを処理する（TODO: entryだけ別）
    router.post('/ticket/resolve', (req, res) => {
      var token: string = req.body.token;
      c.ticket.findTicket(token, (err, t) => {
        if (err) {
          res.json({
            error: String(err),
          });
          return;
        }
        if (t == null) {
          //チケットがなかった
          res.json({
            error: 'そのチケットはありません。',
          });
          return;
        }
        //あった
        var type = t.type;
        //ユーザーを探す
        c.user.user.findOneUser(
          {
            id: t.user,
          },
          (err, u) => {
            if (err || u == null) {
              logger.error(err);
              res.json({
                error: String(err),
              });
              return;
            }
            //結果オブジェクト
            var result: any = {};
            //チケットの種類に応じた処理
            if (type === 'setmail') {
              //メールアドレスを変更
              u.writeData({
                mail: t.data,
              });
            } else if (type === 'resetpassword') {
              //パスワードを再発行
              let newpassword = util.uniqueToken(
                config.get('user.password.maxLength'),
              );
              let d = u.getData();
              result.screen_name = d.screen_name;
              result.newpassword = newpassword;
              u.setData(d, newpassword);
            } else {
              res.json({
                error: '不明なチケットです。',
              });
              return;
            }
            //セーブ
            c.user.user.saveUser(u, err => {
              if (err) {
                logger.error(err);
                res.json({
                  error: String(err),
                });
                return;
              }
              //成功した
              res.json({
                success: true,
                result: result,
              });
              c.ticket.removeTicket(token, err => {
                if (err) {
                  logger.error(err);
                }
              });
            });
          },
        );
      });
    });

    //session
    router.post('/login', (req, res) => {
      var id: string = req.body.user,
        password: string = req.body.password;
      var uq: UserOneQuery;
      if ('string' !== typeof id) {
        id = '';
      }
      if (id.indexOf('@') >= 0) {
        //mail address
        uq = {
          mail: id,
        };
      } else {
        //user id
        uq = {
          screen_name_lower: id.toLowerCase(),
        };
      }
      //login
      c.session.login(req.session! as Session, uq, password, (err, result) => {
        if (err) {
          res.json({
            error: String(err),
          });
        } else if (result !== true) {
          res.json({
            error: 'ユーザー名またはパスワードが間違っています。',
          });
        } else {
          //success
          res.json(
            util.writeUserInfo(req.session! as Session, {
              error: null,
            }),
          );
        }
      });
    });
    router.post('/logout', (req, res) => {
      c.session.logout(req.session! as Session, err => {
        if (err) {
          res.json({
            error: String(err),
          });
        } else {
          res.json({
            error: null,
          });
        }
      });
    });
  }
}
