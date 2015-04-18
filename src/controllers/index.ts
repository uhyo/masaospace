import config=require('config');
import logger=require('../logger');

import db=require('../db');

import TicketController from './ticket';
import mum=require('my-user-mongo');

// 各種の操作
class Controller{
    public user:mum.Manager;
    public ticket:TicketController;

    constructor(private db:db.DBAccess){
        //初期化
        this.user=mum.manager({
            db:db.mongo.getClient(),
            collection:{
                user: config.get("mongodb.collection.user")
            },
            user: {
                userIdLength: config.get("user.idLength")
            }
        });
        this.ticket=new TicketController(db);
    }
    init(callback:Cont):void{
        this.user.init((err:any)=>{
            if(err){
                logger.emergency(err);
                callback(err);
                return;
            }
            this.ticket.init((err:any)=>{
                callback(null);
            });
        });
    }

    getMongoClient(){
        return this.db.mongo.getClient();
    }
    getRedisClient(){
        return this.db.redis.getClient();
    }
}

export = Controller;
