///<reference path="../node.d.ts" />
import {Playlog,PlaylogQuery} from '../data';
import domain=require('domain');
import crypto=require('crypto');

import db=require('../db');
import config=require('config');
import logger=require('../logger');

export default class PlaylogController{
    constructor(private db:db.DBAccess){
    }
    init(callback:Cont):void{
        var d=domain.create();
        d.on("error",(err:any)=>{
            logger.critical(err);
            callback(err);
        });
        //indexes
        this.getCollection(d.intercept((coll)=>{
            coll.createIndex({
                id:1
            },{
                unique:true
            },d.intercept((result)=>{
                coll.createIndex({
                    owner:1,
                    stage:1
                },{
                },d.intercept((result)=>{
                    coll.createIndex({
                        stage:1,
                        score:-1
                    },{
                    },d.intercept((result)=>{
                        d.exit();
                        callback(null);
                    }));
                }));
            }));
        }));
    }
    //新しいログを追加
    //playlog.idはnullでいいという感じがする
    newPlaylog(playlog:Playlog,callback:Callback<string>):void{
        this.getCollection((err,coll)=>{
            if(err){
                callback(err,null);
                return;
            }
            //idを生成
            let hash=crypto.createHash("sha256");
            hash.update(playlog.data);
            playlog.id = hash.digest("hex");
            //DBに保存
            coll.insertOne(playlog,(err,result)=>{
                if(err){
                    logger.error(err);
                    callback(err,null);
                    return;
                }
                //OK
                callback(null,playlog.id);
            });
        });
    }
    findPlaylogs(query:PlaylogQuery,callback:Callback<Array<Playlog>>):void{
        this.getCollection((err,coll)=>{
            if(err){
                callback(err,null);
                return;
            }
            var q:any={};
            if(query.id!=null){
                q.id=query.id;
            }
            if(query.owner!=null){
                q.owner=query.owner;
            }
            if(query.stage!=null){
                q.stage=query.stage;
            }
            var cursor=coll.find(q);
            if(query.skip!=null){
                cursor=cursor.skip(query.skip);
            }
            if(query.limit!=null){
                cursor=cursor.limit(query.limit);
            }
            if(query.sort!=null){
                cursor=cursor.sort(query.sort);
            }
            cursor.toArray((err,docs:Array<Playlog>)=>{
                if(err){
                    logger.error(err);
                    callback(err,null);
                    return;
                }
                callback(null,docs);
            });
        });
    }
    private getCollection(callback:Callback<db.Collection>):void{
        this.db.mongo.collection(config.get("mongodb.collection.playlog"),(err,col)=>{
            if(err){
                logger.critical(err);
                callback(err,null);
            }
            callback(null,col);
        });
    }
}
