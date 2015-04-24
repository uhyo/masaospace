import domain=require('domain');

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
        var d=domain.create();
        d.on("error",(err:any)=>{
            callback(err);
        });

        this.user.init(d.intercept(()=>{
            this.initUser(d.intercept(()=>{
                this.ticket.init((err:any)=>{
                    callback(null);
                });
            }));
        }));
    }
    //ユーザー関連のコレクションの初期化
    private initUser(callback:Cont):void{
        var d=domain.create();
        d.on("error",(err)=>{
            logger.critical(err);
            callback(err);
        });
        this.db.mongo.collection(config.get("mongodb.collection.user"),d.intercept((coll)=>{
            //インデックスを
            coll.createIndex({
                id:1
            },{
                unique:true
            },d.intercept((result)=>{
                coll.createIndex({
                    "data.screen_name":1
                },{
                    unique:true
                },d.intercept((result)=>{
                    callback(null);
                }));
            }));
        }));
    }

    getMongoClient(){
        return this.db.mongo.getClient();
    }
    getRedisClient(){
        return this.db.redis.getClient();
    }
}

export = Controller;
