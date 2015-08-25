///<reference path="../node.d.ts" />
import {Series,SeriesQuery} from '../data';
import domain=require('domain');

import db=require('../db');
import config=require('config');
import logger=require('../logger');

const redis_nextid_key:string = "series:nextid";

export default class SeriesController{
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
                    id:-1
                },{
                },d.intercept((result)=>{
                    coll.createIndex({
                        games:1
                    },{
                    },d.intercept((result)=>{
                        d.exit();
                        this.initRedis(callback);
                    }));
                }));
            }));
        }));
    }
    private initRedis(callback:Cont):void{
        var r=this.db.redis.getClient();
        var d=domain.create();
        d.on("error",(err:any)=>{
            logger.critical(err);
            callback(err);
        });
        //次のコメント番号をとっておく
        this.getCollection(d.intercept((coll)=>{
            coll.findOne({},{
                sort: [['id','desc']],
                fields: {id:1}
            },d.intercept((doc)=>{
                var nextid:number;
                //次のシリーズIDを決定
                if(doc==null){
                    nextid=1;
                }else{
                    nextid=doc.id+1;
                }
                //redisに保存
                r.set(redis_nextid_key, String(nextid), d.intercept((result)=>{
                    //OK
                    d.exit();
                    callback(null);
                }));
            }));
        }));
    }
    //新しいシリーズを追加
    newSeries(series:Series,callback:Callback<number>):void{
        this.getCollection((err,coll)=>{
            if(err){
                callback(err,null);
                return;
            }
            var r=this.db.redis.getClient();
            r.incr(redis_nextid_key, (err,result)=>{
                //シリーズIDを発行した
                if(err){
                    logger.error(err);
                    callback(err,null);
                    return;
                }
                var newid=result-1;
                series.id=newid;

                //DBに保存
                coll.insertOne(series,(err,result)=>{
                    if(err){
                        logger.warning("Series id: "+newid+" is missing");
                        logger.error(err);
                        callback(err,null);
                        return;
                    }
                    //OK
                    callback(null,newid);
                });
            });
        });
    }
    findSeries(query:SeriesQuery,callback:Callback<Array<Series>>):void{
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
            if(query.games!=null){
                q.games=query.games;
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
            cursor.toArray((err,docs:Array<Series>)=>{
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
        this.db.mongo.collection(config.get("mongodb.collection.series"),(err,col)=>{
            if(err){
                logger.critical(err);
                callback(err,null);
            }
            callback(null,col);
        });
    }
}
