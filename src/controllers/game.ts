///<reference path="../node.d.ts" />
import domain=require('domain');

import db=require('../db');
import logger=require('../logger');
import config=require('config');

import extend=require('extend');

import {UserOpenData, GameEditableMetadata, GameMetadataUpdate, GameOpenMetadata, GameMetadata, GameOpenMetadataWithOwnerData, GameData, GamePastData, GameQuery} from '../data';

import util=require('../util');

import {addUserData} from './util';

//constants
const redis_nextid_key:string = "game:nextid";
const redis_playcount_prefix:string = "game:playcount:";

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
        this.getGameCollection(d.intercept((coll)=>{
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
                        "resources.id":1
                    },{
                    },d.intercept((result)=>{
                        //gamedata index
                        this.getMetadataCollection(d.intercept((coll)=>{
                            coll.createIndex({
                                id:1
                            },{
                                unique:1
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
                                        this.getPastCollection(d.intercept((coll)=>{
                                            //gamepast index
                                            coll.createIndex({
                                                id:1,
                                                created:-1
                                            },{
                                            },d.intercept((result)=>{
                                                this.initRedis(callback);
                                            }));
                                        }));
                                    }));
                                }));
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
    //ゲームが存在するか確かめる
    existsGame(id:number,callback:Callback<boolean>):void{
        this.getMetadataCollection((err,coll)=>{
            if(err){
                callback(err,null);
                return;
            }
            coll.count({id:id},{limit:1},(err,num)=>{
                if(err){
                    logger.error(err);
                    callback(err,null);
                    return;
                }
                callback(null, num>0);
            });
        });
    }
    //ゲームをロードする
    //playcount: ゲームの閲覧数を1増やす
    //そのゲームが存在しない場合はnull
    getGame(id:number,playcount:boolean,callback:Callback<{game:GameData; metadata:GameMetadata}>):void{
        var _this=this, game:GameData, metadata:GameMetadata, errend=false;
        //並列な感じで読み込む
        this.getMetadataCollection((err,collm)=>{
            if(err){
                if(!errend){
                    errend=true;
                    callback(err,null);
                }
                return;
            }
            collm.findOne({id:id},(err,doc)=>{
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
            collg.findOne({id:id},(err,doc)=>{
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
                if(playcount){
                    _this.addPlayCount(id,(err,playcount)=>{
                        if(err){
                            callback(err,null);
                            return;
                        }
                        metadata.playcount=playcount;
                        callback(null,{game,metadata});
                    });
                }else{
                    let r=_this.db.redis.getClient();
                    r.get(redis_playcount_prefix+id,(err,playcount)=>{
                        if(err){
                            logger.error(err);
                            callback(err,null);
                            return;
                        }
                        metadata.playcount=parseInt(playcount);
                        callback(null,{game,metadata});
                    });
                }
            }
        }
    }
    //新しいゲームを作成(callbackでゲームIDを返す）
    newGame(game:GameData,metadata:GameMetadataUpdate,callback:Callback<number>):void{
        this.getGameCollection((err,collg)=>{
            if(err){
                callback(err,null);
                return;
            }
            this.getMetadataCollection((err,collm)=>{
                if(err){
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
                    game.id=newid;
                    var now=new Date();
                    var metadataobj:GameMetadata={
                        id: newid,  //metadata.idを使わない
                        owner: metadata.owner,
                        title: metadata.title,
                        description: metadata.description,
                        tags: metadata.tags,
                        created: now,
                        playcount: 0,
                        updated: now
                    };
                    //DBに保存
                    collg.insertOne(game,(err,result)=>{
                        if(err){
                            logger.warning("Game id: "+newid+" is missing");
                            logger.error(err);
                            callback(err,null);
                            return;
                        }
                        collm.insertOne(metadataobj,(err,result)=>{
                            if(err){
                                //やばい！！！！！！！gameだけ入った！！！！！！！！
                                logger.warning("Game id: "+newid+" is missing");
                                logger.error(err);
                                collg.deleteOne({
                                    id: newid
                                },(err2,result)=>{
                                    if(err2){
                                        //もう知らん！！！！！
                                        logger.alert("Failed to remove gamedata id:"+newid);
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
    //ゲームを変更する（オーナーのチェックもする）
    editGame(id:number,owner:string,game:GameData,metadata:GameMetadataUpdate,callback:Cont):void{
        game.id=metadata.id=id;
        this.getGameCollection((err,collg)=>{
            if(err){
                callback(err);
                return;
            }
            this.getMetadataCollection((err,collm)=>{
                if(err){
                    callback(err);
                    return;
                }
                //まず今までのやつをとっておく
                collg.findOne({id},(err,gamedoc:GameData)=>{
                    if(err){
                        logger.error(err);
                        callback(err);
                        return;
                    }
                    collm.findOne({id},(err,metadatadoc:GameMetadata)=>{
                        if(err){
                            logger.error(err);
                            callback(err);
                            return;
                        }
                        if(gamedoc==null || metadatadoc==null){
                            callback("そのゲームIDは存在しません。");
                            return;
                        }
                        if(metadatadoc.owner!==owner){
                            callback("所有者が違います。");
                            return;
                        }

                        //コピーすべき情報はコピー
                        var newMetadata:GameMetadata = {
                            id: id,
                            owner: metadata.owner,
                            title: metadata.title,
                            description: metadata.description,
                            tags: metadata.tags,
                            created: metadatadoc.created,
                            playcount: metadatadoc.playcount,
                            updated: new Date()
                        };
                        //過去ログを作成
                        var pastdata: GamePastData={
                            id,
                            created: metadatadoc.updated,
                            game: gamedoc,
                            metadata: metadatadoc
                        };
                        //入れる
                        this.getPastCollection((err,collp)=>{
                            if(err){
                                callback(err);
                                return;
                            }
                            collp.insertOne(pastdata,(err,result)=>{
                                if(err){
                                    logger.error(err);
                                    callback(err);
                                    return;
                                }
                                //そして本命の変更
                                collg.replaceOne({id},game,(err,result)=>{
                                    if(err){
                                        logger.error(err);
                                        callback(err);
                                        return;
                                    }
                                    collm.replaceOne({id},newMetadata,(err,result)=>{
                                        if(err){
                                            logger.error(err);
                                            logger.alert("Game id "+id+" is inconsistent");
                                            callback(err);
                                        }
                                        //おわり
                                        callback(null);
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    }
    //ゲームを見つける
    findGames(query:GameQuery,callback:Callback<Array<GameMetadata>>):void{
        this.getMetadataCollection((err,coll)=>{
            if(err){
                callback(err,null);
                return;
            }
            var q:any={};
            if(query.owner!=null){
                q.owner=query.owner;
            }
            coll.find(q).skip(query.skip).limit(query.limit).sort(query.sort).toArray((err,docs:Array<GameMetadata>)=>{
                if(err){
                    logger.error(err);
                    callback(err,null);
                    return;
                }
                callback(null,docs);
            });
        });
    }
    //リソースを使用しているゲームを見つける
    countResourceUsingGames(fileid:string,callback:Callback<number>):void{
        this.getGameCollection((err,coll)=>{
            if(err){
                callback(err,null);
                return;
            }
            coll.count({
                "resources.id":fileid
            },(err,num)=>{
                if(err){
                    logger.error(err);
                    callback(err,null);
                }
                callback(null,num);
            });
        });
    }
    //リソースIDを変更する（newidがnullだったらリソースなし）
    replaceResource(oldid:string,newid:string,callback:Cont):void{
        this.getGameCollection((err,coll)=>{
            if(err){
                callback(err);
                return;
            }
            var op;
            if(newid==null){
                //消すだけでいい
                op={
                    $pull: {
                        resources: {
                            id: oldid
                        }
                    }
                };
            }else{
                //書き換える
                op={
                    $set: {
                        "resources.$.id":newid
                    }
                };
            }
            coll.updateMany({
                "resources.id":oldid
            },op,(err,result)=>{
                if(err){
                    logger.error(err);
                }
                callback(err);
            });
        });
    }
    //ゲームデータにユーザーデータを追加
    addUserData(games:Array<GameOpenMetadata>,callback:Callback<Array<GameOpenMetadataWithOwnerData>>):void{
        addUserData(this.db,games,"owner",callback);
    }
    //閲覧カウントを増やす
    //（このidのゲームが実在することは保証されていてほしい）
    addPlayCount(id:number,callback?:Callback<number>):void{
        if(callback==null){
            callback=(err,_)=>{};
        }
        var r=this.db.redis.getClient();
        var key:string=redis_playcount_prefix+id;
        r.incr(key,(err,result)=>{
            if(err){
                logger.error(err);
                callback(err,null);
                return;
            }
            if(result<=1){
                //resultが1だったら何か怪しい（消えてるのでは？）
                //DBからリストアする
                this.getMetadataCollection((err,coll)=>{
                    if(err){
                        logger.error(err);
                        callback(err,null);
                        return;
                    }
                    coll.findOne({id},{
                        fields: {playcount:1}
                    },(err,doc)=>{
                        if(err){
                            logger.error(err);
                            callback(err,null);
                            return;
                        }
                        if(doc==null){
                            //ないじゃん
                            r.del(key);
                            callback(null,0);
                            return;
                        }
                        if(result<doc.playcount){
                            //あった
                            r.set(key,doc.playcount+1);
                            callback(null,doc.playcount+1);
                        }else{
                            callback(null,result);
                        }
                    });
                });
            }else if(result%100===0){
                //100単位で保存
                callback(null,result);
                this.getMetadataCollection((err,coll)=>{
                    if(err){
                        logger.error(err);
                        callback(err,null);
                        return;
                    }
                    coll.updateOne({
                        id,
                        playcount: {$lte: result}
                    },{
                        $set: {
                            playcount: Number(result)
                        }
                    },(err,result2)=>{
                        if(err){
                            logger.error(err);
                        }
                    });
                });
            }else{
                callback(null,result);
            }
        });
    }

    //MongoDBのコレクションを得る
    private getGameCollection(callback:Callback<db.Collection>):void{
        this.getCollection(config.get("mongodb.collection.gamedata"),callback);
    }
    private getMetadataCollection(callback:Callback<db.Collection>):void{
        this.getCollection(config.get("mongodb.collection.gamemetadata"),callback);
    }
    private getPastCollection(callback:Callback<db.Collection>):void{
        this.getCollection(config.get("mongodb.collection.gamepast"),callback);
    }
    private getCollection(name:string,callback:Callback<db.Collection>):void{
        this.db.mongo.collection(name,(err,col)=>{
            if(err){
                logger.critical(err);
                callback(err,null);
                return;
            }
            callback(null,col);
        });
    }
}

