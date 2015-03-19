///<reference path="./node.d.ts" />
// Web server
import config=require('config');

import https=require('https');
import express=require('express');

import logger=require('logger');

export class WebServer{
    private app:express.Express;
    constructor(){
    }
    init(callback:Cont):void{
        //open web server
        this.app=express();

        this.route();

        this.app.listen(config.get("webserver.port"));
        process.nextTick(()=>{
            callback(null);
        });
    }
    route():void{
    }
}
