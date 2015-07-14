///<reference path="../node.d.ts" />
import domain=require('domain');

import db=require('../db');
import logger=require('../logger');
import config=require('config');

import {GameMetadata, GameData} from '../data';

//constants
const redis_nextid_key:string = "game:nextid";

export default class GameController{
    constructor(private db:db.DBAccess){
    }
    init(callback:Cont):void{
        var d=domain.create();
        d.on("error",(err:any)=>{
            logger.critical(err);
            callback(err);
        });

        //indexes
        this.db.mongo.collection(config.get("mongodb.collection.gamemetadata"),d.intercept((coll)=>{
            coll.createIndex({
                id:1
            },{
                unique:true
            },d.intercept((result)=>{
                coll.createIndex({
                    owner:1,
                    created:1
                },{
                },d.intercept((result)=>{
                    coll.createIndex({
                        created:1
                    },{
                    },d.intercept((result)=>{
                        //gamedata index
                        this.db.mongo.collection(config.get("mongodb.collection.gamedata"),d.intercept((coll)=>{
                            coll.createIndex({
                                id:1
                            },{
                                unique:1
                            },d.intercept((result)=>{
                                this.initRedis(callback);
                            }));
                        }));
                    }));
                }));
            }));
        }));
    }
    //Redisのデータを初期化
    private initRedis(callback:Cont):void{
        var r=this.db.redis.getClient();
        //次のゲーム番号を取得する
        this.getMetadataCollection((err,coll)=>{
            if(err){
                callback(err);
                return;
            }
            //いちばん新しいゲームを得る
            coll.findOne({},{
                sort: [['id','desc']],
                fields: {id:1}
            },(err,doc)=>{
                var nextid:number;
                if(err){
                    logger.error(err);
                    callback(err);
                    return;
                }
                //次のゲームのIDを求める
                if(doc==null){
                    nextid=1;
                }else{
                    nextid=doc.id+1;
                }
                //Redisに保存
                r.set(redis_nextid_key, String(nextid), (err,result)=>{
                    if(err){
                        logger.error(err);
                        callback(err);
                        return;
                    }
                    //OK
                    callback(null);
                });
            });
        });
    }
    //ゲームをロードする
    //そのゲームが存在しない場合はnull
    getGame(id:number,callback:Callback<{game:GameData; metadata:GameMetadata}>):void{
        var _this, game:GameData, metadata:GameMetadata, errend=false;
        //並列な感じで読み込む
        this.getMetadataCollection((err,collm)=>{
            if(err){
                if(!errend){
                    errend=true;
                    callback(err,null);
                }
                return;
            }
            collm.findOne({id:1},(err,doc)=>{
                if(doc==null){
                    //ゲームがない
                    if(!errend){
                        errend=true;
                        callback(null,null);
                    }
                    return;
                }
                metadata=doc;
                next();
            });
        });
        this.getGameCollection((err,collg)=>{
            if(err && !errend){
                errend=true;
                callback(err,null);
                return;
            }
            collg.findOne({id:1},(err,doc)=>{
                if(doc==null){
                    //ゲームがない
                    if(!errend){
                        errend=true;
                        callback(null,null);
                    }
                    return;
                }
                game=doc;
                next();
            });
        });

        function next():void{
            if(errend){
                return;
            }
            if(game!=null && metadata!=null){
                //データ揃った
                callback(null,{game,metadata});
            }
        }
    }
    //新しいゲームを作成(callbackでゲームIDを返す）
    newGame(game:GameData,metadata:GameMetadata,callback:Callback<number>):void{
        this.getGameCollection((err,collg)=>{
            if(err){
                logger.error(err);
                callback(err,null);
                return;
            }
            this.getMetadataCollection((err,collm)=>{
                if(err){
                    logger.error(err);
                    callback(err,null);
                    return;
                }
                var r=this.db.redis.getClient();
                //ゲームIDを発行
                r.incr(redis_nextid_key,(err,result)=>{
                    if(err){
                        logger.error(err);
                        callback(err,null);
                        return;
                    }
                    //resultはID+1になっているので1引いたものが新しいID
                    var newid=result-1;
                    game.id=metadata.id=newid;
                    //DBに保存
                    collg.insertOne(game,(err,result)=>{
                        if(err){
                            logger.warning("Game id: "+newid+" is missing");
                            logger.error(err);
                            callback(err,null);
                            return;
                        }
                        collm.insertOne(metadata,(err,result)=>{
                            if(err){
                                //やばい！！！！！！！gameだけ入った！！！！！！！！
                                logger.warning("Game id: "+newid+" is missing");
                                logger.error(err);
                                collg.deleteOne({
                                    id: newid
                                },(err2,result)=>{
                                    if(err2){
                                        //もう知らん！！！！！
                                        logger.critical("Failed to remove gamedata id:"+newid);
                                        logger.critical(err);
                                        logger.critical(err2);
                                    }
                                    //なんとかもどした（newidは欠番に）
                                    callback(err,null);
                                    return;
                                });
                                callback(err,null);
                                return;
                            }
                            //ゲームの追加に成功した
                            callback(null,newid);
                        });
                    });
                });
            });
        });
    }

    //MongoDBのコレクションを得る
    private getGameCollection(callback:Callback<db.Collection>):void{
        this.db.mongo.collection(config.get("mongodb.collection.gamedata"),(err,col)=>{
            if(err){
                logger.critical(err);
                callback(err,null);
            }
            callback(null,col);
        });
    }
    private getMetadataCollection(callback:Callback<db.Collection>):void{
        this.db.mongo.collection(config.get("mongodb.collection.gamemetadata"),(err,col)=>{
            if(err){
                logger.critical(err);
                callback(err,null);
            }
            callback(null,col);
        });
    }
}

