///<reference path="./data.d.ts" />
import Controller=require('../controllers/index');

import config=require('config');

export default function(c:Controller,r:_Router):void{
    //top view
    r.add("/",(obj,callback:Callback<View>)=>{
        callback(null,{
            title:"",
            page:"top",
            data:{}
        });
    });
}
