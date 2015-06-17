///<reference path="./data.d.ts" />
import Controller=require('../controllers/index');

import config=require('config');

export default function(c:Controller,r:_Router):void{
    //about user

    //new entry
    r.add("/entry",(callback:Callback<View>)=>{
        callback(null,{
            title: "新規登録",
            page:"user.entry",
            data:{}
        });
    });
}
