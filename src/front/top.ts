///<reference path="./data.d.ts" />
import Controller=require('../controllers/index');

import config=require('config');

export default function(c:Controller,r:_Router):void{
    //top view
    r.add("/",(callback:Callback<View>)=>{
        callback(null,{
            title:config.get("service.name"),
            page:"top",
            data:{}
        });
    });
}
