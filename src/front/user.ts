///<reference path="./data.d.ts" />
import Controller=require('../controllers/index');

import config=require('config');

export default function(c:Controller,r:_Router):void{
    //about user

    //new entry
    r.add("/entry",(obj,callback:Callback<View>)=>{
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

    //my page
    r.add("/my",(obj,callback:Callback<View>)=>{
        callback(null,{
            title: "マイページ",
            page:"user.my",
            data:{
            }
        });
    });
}
