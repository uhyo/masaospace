///<reference path="../node.d.ts" />
import express=require('express');
import Controller=require('../controllers/index');

import logger=require('../logger');

import config=require('config');

import {User,UserData} from '../data';


//User auth&session
class C{
    route(router:express._Router,c:Controller):void{
        // 新規ユーザー登録
        router.post("/entry",(req,res)=>{
            //バリデーション
            req.checkBody("screen_name","ユーザーID").isUserID();
            req.checkBody("name","ユーザー名").isUserName();
            req.checkBody("mail","メールアドレス").isEmail();

            if(req.validationErrors()){
                res.json({
                    error:String(req.validationErrors())
                });
                return;
            }

            //screen_nameの重複をチェック
            //新しいユーザーデータを作る
            var data:UserData={
                activated: false,
                screen_name:req.body.screen_name,
                screen_name_lower:req.body.screen_name.toLowerCase(),
                name:req.body.name,
                mail:req.body.mail,

                created:new Date()
            };
            //既存のユーザーとの重複をチェック
            c.user.user.findOneUser({
                screen_name_lower:data.screen_name_lower
            },(err,user)=>{
                if(err){
                    throw err;
                }
                if(user!=null){
                    //ユーザーすでに存在
                    res.json({
                        error:"そのユーザーIDは使用されています。"
                    });
                    return;
                }
                //ユーザーを登録
                c.user.entry(data,(err,result)=>{
                    if(err){
                        logger.error(err);
                        res.json({
                            error:String(err)
                        });
                        return;
                    }
                    let u:User=result.user;
                    //登録完了。チケットを発行
                    c.ticket.newTicket({
                        type: "setpassword",
                        user: u.id
                    },(err,t)=>{
                        if(err){
                            res.json({
                                error:String(err)
                            });
                            return;
                        }
                        //user entry success
                        res.json({
                            screen_name:u.getData().screen_name,
                            ticket: t.token
                        });
                    });
                });
            });
        });
        //ユーザー登録（チケットチェック）
        router.get("/entry/check",(req,res)=>{
            var token:string=req.query.token;
            //トークンを探してあげる
            c.ticket.findTicket(token,(err,t)=>{
                if(err){
                    res.json({
                        error:String(err)
                    });
                    return;
                }
                res.json({
                    //チケットがあればtrue,なければfalse
                    ticket: t!=null
                });
            });
        });
        //パスワード設定
        router.post("/entry/setpassword",(req,res)=>{
            var token:string=req.body.token, screen_name:string=req.body.screen_name;

            req.checkBody("password","パスワード");
            if(req.validationErrors()){
                res.json({
                    error:String(req.validationErrors())
                });
                return;
            }

            var password:string=req.body.password;
            //トークンを探して
            c.ticket.findTicket(token,(err,t)=>{
                if(err){
                    res.json({
                        error:String(err)
                    });
                    return;
                }
                if(t==null){
                    //不正なトークンでは
                    res.json({
                        error: "トークンが不正です。"
                    });
                    return;
                }
                //ユーザーも探して
                c.user.user.findOneUser({
                    id: t.user
                },(err,u)=>{
                    if(err){
                        logger.error(err);
                        res.json({
                            error:String(err)
                        });
                        return;
                    }
                    //screen_name一致チェック
                    var data:UserData=u.getData();
                    if(data.screen_name!==screen_name){
                        res.json({
                            error:"screen_nameが一致しません。"
                        });
                        return;
                    }
                    //パスワードをセット
                    u.setData(data,password);
                    //activate
                    u.writeData({
                        activated: true
                    });
                    //セーブ
                    c.user.user.saveUser(u,(err,result)=>{
                        if(err){
                            logger.error(err);
                            res.json({
                                error:String(err)
                            });
                            return;
                        }
                        //成功した
                        res.json({
                            success:true
                        });
                    });
                });
            });
        });
    }
}
export = C;
