import domain=require('domain');

import config=require('config');
import logger=require('../logger');

import db=require('../db');

import TicketController from './ticket';
import FileController from './file';
import SessionController from './session';
import GameController from './game';
import MailController from './mail';
import mum=require('my-user-mongo');

// 各種の操作
class Controller{
    public user:mum.Manager;
    public ticket:TicketController;
    public file:FileController;
    public session:SessionController;
    public game:GameController;
    public mail:MailController;

    constructor(private db:db.DBAccess){
    }
    init(callback:Cont):void{
        var db=this.db;
        var d=domain.create();
        d.on("error",(err:any)=>{
            callback(err);
        });

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
        this.file  =new FileController(db);
        this.session= new SessionController(db,this.user);
        this.game  =new GameController(db);
        this.mail  =new MailController(db);

        logger.debug("Controller: initialization start.");
        this.user.init(d.intercept(()=>{
            this.initUser(d.intercept(()=>{
                logger.debug("Controller.user initialized.");
                this.ticket.init(d.intercept(()=>{
                    logger.debug("Controller.ticket initialized.");
                    this.session.init(d.intercept(()=>{
                        logger.debug("Controller.session initialized.");
                        this.game.init(d.intercept(()=>{
                            logger.debug("Controller.game initialized.");
                            this.mail.init(d.intercept(()=>{
                                logger.debug("Controller.mail initialized.");
                                callback(null);
                            }));
                        }));
                    }));
                }));
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
                    "data.screen_name_lower":1
                },{
                    unique:true
                },d.intercept((result)=>{
                    coll.createIndex({
                        "data.mail":1
                    },{
                        unique:true
                    },d.intercept((result)=>{
                        callback(null);
                    }));
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
