///<reference path="../node.d.ts" />
import express=require('express');
import db=require('../db');

//User auth&session
var b:Callback<string>;

class C{
    route(router:express._Router,db:db.DBAccess):void{
        // 新規ユーザー登録
        /*router.post("/entry",(req,res)=>{

        });*/
    }
}
export = C;
