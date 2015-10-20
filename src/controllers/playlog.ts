//<reference path="../node.d.ts" />
import {Playlog, NewPlaylog, PlaylogQuery, GameData} from '../data';
import domain=require('domain');
import crypto=require('crypto');
import zlib=require('zlib');

import db=require('../db');
import config=require('config');
import logger=require('../logger');
import masao=require('../../lib/masao');

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
                    game:1
                },{
                },d.intercept((result)=>{
                    coll.createIndex({
                        game:1,
                        score:-1
                    },{
                    },d.intercept((result)=>{
                        coll.createIndex({
                            owner:1,
                            created:-1
                        },{
                        },d.intercept((result)=>{
                            d.exit();
                            callback(null);
                        }));
                    }));
                }));
            }));
        }));
    }
    //新しいログを追加
    //playlog.idとplaylog.dataはnullでいいという感じがする
    newPlaylog(game:GameData&{_id:any},playlog:NewPlaylog,callback:Callback<Playlog>):void{
        this.getCollection((err,coll)=>{
            if(err){
                callback(err,null);
                return;
            }
            //まずデータをBufferにする
            let buf=new Buffer(playlog.dataBase64,"base64");
            //データが妥当か調べる
            let playlogobj;
            try{
                playlogobj = masao.playlog.parse(buf);
            }catch(e){
                //だめなデータだ
                callback(e,null);
                return;
            }
            //idを生成
            let hash=crypto.createHash("sha256");
            hash.update(buf);
            let id = hash.digest("hex");
            //データはgzipする
            zlib.gzip(buf,(err,buff)=>{
                if(err){
                    callback(err,null);
                    return;
                }
                //DBに入れるデータを作成
                let pl:Playlog = {
                    id,
                    owner: playlog.owner,
                    game: game.id,
                    game_id: game._id,
                    cleared: masao.getLastStage(game.params)===playlogobj.stage,
                    stage: playlogobj.stage,
                    score: playlogobj.score,
                    created: new Date(),
                    data: buff
                };
                //DBに保存
                coll.insertOne(pl,(err,result)=>{
                    if(err){
                        logger.error(err);
                        callback(err,null);
                        return;
                    }
                    //OK
                    callback(null,pl);
                });
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
            if(query.game!=null){
                q.game=query.game;
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
    //idで一覧にする
    joinPlaylogs(ids:Array<string>,callback:Callback<{
        [id:string]:Playlog;
    }>):void{
        this.getCollection((err,coll)=>{
            if(err){
                callback(err,null);
                return;
            }
            let result:{
                [id:string]:Playlog;
            }={};
            coll.find({
                id: {
                    $in: ids
                }
            }).toArray((err,docs:Array<Playlog>)=>{
                if(err){
                    callback(err,null);
                    return;
                }
                for(let i=0,l=docs.length;i<l;i++){
                    let p=docs[i];
                    result[p.id]=p;
                }
                callback(null,result);
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