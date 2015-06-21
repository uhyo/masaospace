///<reference path="../node.d.ts" />
import express=require('express');
import Controller=require('../controllers/index');

import logger=require('../logger');

import config=require('config');

import {User,UserData, UserOneQuery} from '../data';


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
                    error:JSON.stringify(req.validationErrors())
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
                $or:[
                    {
                        "data.screen_name_lower":data.screen_name_lower
                    },{
                        "data.mail":data.mail
                    }
                ]
            },(err,user)=>{
                if(err){
                    throw err;
                }
                if(user!=null){
                    //ユーザーすでに存在
                    let d=user.getData();
                    if(d.screen_name_lower===data.screen_name_lower){
                        res.json({
                            error:"そのユーザーIDは使用されています。"
                        });
                    }else{
                        res.json({
                            error:"そのメールアドレスは既に登録されています。"
                        });
                    }
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
                            //TODO
                            ticket: t.token
                        });
                    });
                });
            });
        });
        //ユーザー登録（チケットチェック）
        router.post("/entry/check",(req,res)=>{
            var token:string=req.body.token;
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

            req.checkBody("password","パスワード").isPassword();
            if(req.validationErrorResponse(res)){
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
                        c.ticket.removeTicket(token,(err)=>{
                            if(err){
                                logger.error(err);
                            }
                        });
                    });
                });
            });
        });

        //session
        router.post("/login",(req,res)=>{
            var id:string=req.body.user, password:string=req.body.password;
            var uq:UserOneQuery;
            if("string"!==typeof id){
                id="";
            }
            if(id.indexOf("@")>=0){
                //mail address
                uq={
                    mail:id
                };
            }else{
                //user id
                uq={
                    screen_name_lower:id.toLowerCase();
                };
            }
            //login
            c.session.login(req.session,uq,password,(err,result)=>{
                if(err){
                    res.json({
                        error:String(err)
                    });
                }else if(result!==true){
                    res.json({
                        error:"ユーザー名またはパスワードが間違っています。"
                    });
                }else{
                    //success
                    res.json({
                        error:null,
                        //user info
                        screen_name:req.session.screen_name,
                        name:req.session.name
                    });
                }
            });
        });
        router.post("/logout",(req,res)=>{
            c.session.logout(req.session,(err)=>{
                if(err){
                    res.json({
                        error:String(err)
                    });
                }else{
                    res.json({
                        error:null
                    });
                }
            });
        });
    }
}
export = C;
