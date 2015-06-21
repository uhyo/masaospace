///<reference path="./data.d.ts" />
import Controller=require('../controllers/index');

import config=require('config');

export default function(c:Controller,r:_Router):void{
    //top view
    r.add("/",(obj,callback:Callback<View>)=>{
        var title=config.get("service.name");
        callback(null,{
            title:title,
            page:"top",
            data:{
                title:title,
            }
        });
    });
}
