///<reference path="./data.d.ts" />
import Controller from '../controllers/index';

import logger=require('../logger');

export default function(c:Controller,r:_Router):void{
    //about user

    //new entry
    r.add("/entry/page",(_,callback:Callback<View>)=>{
        callback(null,{
            title: "新規登録",
            page:"user.entry",
            data:{}
        });
    });

    //ticket checker
    r.addPattern(":ticket",/^[0-9a-zA-Z]+$/);
    r.addPattern(":userid",/^[0-9a-zA-Z_]+$/);
    r.add("/entry/ticket/:userid/:ticket",(obj,callback:Callback<View>)=>{
        callback(null,{
            title: "パスワード設定",
            page:"user.ticket",
            data:{
                screen_name:obj[":userid"],
                ticket:obj[":ticket"]
            }
        });
    });

    //reset password
    r.add("/entry/reset",(_,callback:Callback<View>)=>{
        callback(null,{
            title: "パスワード再発行",
            page:"user.reset",
            data:{
            }
        });
    });

    //my page
    r.add("/my",(_,callback:Callback<View>)=>{
        callback(null,{
            title: "マイページ",
            page:"user.my",
            data:{
            }
        });
    });
    r.add("/my/ticket/:ticket",(obj,callback:Callback<View>)=>{
        callback(null,{
            title: "各種手続",
            page:"user.ticket",
            data:{
                ticket: obj[":ticket"]
            }
        });
    });

    //user page
    r.add("/:userid",(obj,callback:Callback<View>)=>{
        c.user.user.findOneUser({
            "data.screen_name_lower":obj[":userid"].toLowerCase(),
            "data.activated": true
        },(err,user)=>{
            if(err){
                logger.error(err);
                callback(err,null);
                return;
            }
            if(user==null){
                callback(null,{
                    status: 404,
                    title: null,
                    page: null,
                    data: null
                });
                return;
            }
            var d=user.getData();
            callback(null,{
                title: d.name,
                page:"user.page",
                data:{
                    userid: user.id,
                    data: d
                }
            });
        });
    });
    //account setting
    r.add("/my/account",(_,callback:Callback<View>)=>{
        callback(null,{
            title:"アカウント設定",
            page:"user.account",
            data:{
            }
        });
    });
}
