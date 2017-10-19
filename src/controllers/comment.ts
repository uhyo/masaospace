///<reference path="../node.d.ts" />
import * as domain from 'domain';

import * as db from '../db';
import * as config from 'config';
import * as logger from '../logger';

import {Comment, CommentQuery, CommentWithUserData} from '../data';

import {addUserData} from './util';

const redis_nextid_key:string = "comment:nextid";

//comment controller
export default class CommentController{
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
                unique: true
            },d.intercept(()=>{
                coll.createIndex({
                    game:1,
                    id:-1
                },{
                },d.intercept(()=>{
                    coll.createIndex({
                        game:1,
                        score:-1,
                        cleared:-1,
                        id:1
                    },{
                    },d.intercept(()=>{
                        coll.createIndex({
                            userid:1,
                            id:-1
                        },{
                        },d.intercept(()=>{
                            //redisをあれする
                            this.initRedis(callback);
                        }));
                    }));
                }));
            }));
        }));
    }
    //新しいコメントを投稿
    newComment(comment:Comment,callback:Callback<number>):void{
        this.getCollection((err,coll)=>{
            //コメントIDをRedisから発行
            if (err != null || coll == null){
                callback(err, null);
                return;
            }
            var r=this.db.redis.getClient();
            // XXX https://github.com/DefinitelyTyped/DefinitelyTyped/pull/20625
            r.incr(redis_nextid_key, ((err: any, result: number)=>{
                if(err){
                    logger.error(err);
                    callback(err, null);
                    return;
                }
                //newid番目を確保した
                var newid=result-1;
                comment.id=newid;

                //DBに保存
                coll.insertOne(comment,(err)=>{
                    if(err != null){
                        logger.warning("Comment id: "+newid+" is missing");
                        logger.error(err);
                        callback(err,null);
                        return;
                    }
                    //入った
                    callback(null,newid);
                });
            }) as any);
        });
    }
    //コメントを探す
    findComments(query:CommentQuery,callback:Callback<Array<Comment>>):void{
        this.getCollection((err,coll)=>{
            if(err || coll == null){
                callback(err,null);
                return;
            }
            var q:any={};
            if(query.id!=null){
                q.id=query.id;
            }
            if(query.game!=null){
                q.game=query.game;
            }
            if(query.userid!=null){
                q.userid=query.userid;
            }
            coll.find(q).skip(query.skip).limit(query.limit).sort(query.sort).toArray((err,docs:Array<Comment>)=>{
                if(err){
                    logger.error(err);
                    callback(err,null);
                    return;
                }
                callback(null,docs);
            });
        });
    }
    //コメントにユーザーデータを追加
    addUserData(docs:Array<Comment>,callback:Callback<Array<CommentWithUserData>>):void{
        addUserData(this.db, docs, "userid", callback);
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
                //次のコメントIDを決定
                if(doc==null){
                    nextid=1;
                }else{
                    nextid=doc.id+1;
                }
                //redisに保存
                r.set(redis_nextid_key, String(nextid), d.intercept(()=>{
                    //OK
                    callback(null);
                }));
            }));
        }));
    }
    //コレクションを得る
    private getCollection(callback:Callback<db.Collection>):void{
        this.db.mongo.collection(config.get("mongodb.collection.comment"),(err,col)=>{
            if(err){
                logger.critical(err);
                callback(err,null);
                return;
            }
            callback(null,col);
        });
    }
}
