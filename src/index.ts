///<reference path="./node.d.ts" />
import domain=require('domain');

import config=require('config');
import logger=require('./logger');

import db=require('./db');
import web=require('./web');

import Controller=require('./controllers/index');

export class System{
    private db:db.DBAccess;
    private srv:web.WebServer;
    private c:Controller;
    constructor(){
        this.db=new db.DBAccess();
        this.srv=new web.WebServer();
        this.c=new Controller(this.db);
    }
    init(callback:Cont):void{
        logger.info("System is preparing.");
        var d=domain.create();
        d.on("error",(err)=>{
            logger.emergency(err);
            d.removeAllListeners("error");
            callback(err);
        });

        //connect DB
        this.db.connect(d.intercept(()=>{
            this.c.init(d.intercept(()=>{
                //web server
                this.srv.init(this.db,d.intercept(()=>{
                    logger.info("System is ready.");
                    callback(null);
                }));
            }));
        }));
    }
}
