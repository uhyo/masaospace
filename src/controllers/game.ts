///<reference path="../node.d.ts" />
import * as domain from 'domain';
import * as cron from 'cron';

import * as db from '../db';
import * as logger from '../logger';
import * as config from 'config';

import {
    Game as GameData,
    GamePastData,
    GameMetadataUpdate,
    GameOpenMetadata,
    GameMetadata,
    GameOpenMetadataWithOwnerData,
    GameQuery,
} from '@uhyo/masaospace-util';


import {
    addUserData,
} from './util';

//constants
const redis_nextid_key:string = "game:nextid";
const redis_playcount_prefix:string = "game:playcount:";
const redis_tagscore_prefix:string = "game:tagscore";

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
            },d.intercept(()=>{
                coll.createIndex({
                    "resources.id":1
                },{
                },d.intercept(()=>{
                    //gamedata index
                    this.getMetadataCollection(d.intercept((coll)=>{
                        coll.createIndex({
                            id:1
                        },{
                            unique:1
                        },d.intercept(()=>{
                            coll.createIndex({
                                owner:1,
                                created:1
                            },{
                            },d.intercept(()=>{
                                coll.createIndex({
                                    hidden:1,
                                    created:1
                                },{
                                },d.intercept(()=>{
                                    coll.createIndex({
                                        hidden: 1,
                                        tags: 1
                                    },{
                                    },d.intercept(()=>{
                                        coll.createIndex({
                                            hidden: 1,
                                            owner: 1,
                                            created: 1
                                        },{
                                        },d.intercept(()=>{
                                            this.getPastCollection(d.intercept((coll)=>{
                                                //gamepast index
                                                coll.createIndex({
                                                    id:1,
                                                    created:-1
                                                },{
                                                },d.intercept(()=>{
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
        }));
        //cron job
        new cron.CronJob("0 0 0,12 * * *",()=>{
            //tags setをdeleteする
            var now=new Date(), h12=now.getHours()-12;
            var key=redis_tagscore_prefix+(Math.abs(h12)<3 ? "0" : "1");
            this.db.redis.getClient().del(key);
        },void 0,true,"Asia/Tokyo");
    }
    //Redisのデータを初期化
    private initRedis(callback:Cont):void{
        var r=this.db.redis.getClient();
        //次のゲーム番号を取得する
        this.getMetadataCollection((err,coll)=>{
            if(err || coll == null){
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
                r.set(redis_nextid_key, String(nextid), (err)=>{
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
    /*existsGame(id:number,callback:Callback<boolean>):void{
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
    }*/
    //ゲームをロードする
    //playcount: ゲームの閲覧数を1増やす
    //そのゲームが存在しない場合はnull
    getGame(id:number,playcount:boolean,callback:Callback<{game:GameData&{_id:any}; metadata:GameMetadata&{_id:any}}>):void{
        var _this=this, game:GameData&{_id:any}, metadata:GameMetadata&{_id:any}, errend=false;
        //並列な感じで読み込む
        this.getMetadataCollection((err,collm)=>{
            if(err || collm == null){
                if(!errend){
                    errend=true;
                    callback(err,null);
                }
                return;
            }
            collm.findOne({id:id},(_,doc)=>{
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
            if(err || collg == null){
               if(!errend){
                    errend=true;
                    callback(err,null);
                }
                return;
            }
            collg.findOne({id:id},(_,doc)=>{
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
                if(playcount && metadata.hidden!==true){
                    _this.addPlayCount(metadata,(err,playcount)=>{
                        if(err || playcount == null){
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
            if(err || collg == null){
                callback(err,null);
                return;
            }
            this.getMetadataCollection((err,collm)=>{
                if(err || collm == null){
                    callback(err,null);
                    return;
                }
                var r=this.db.redis.getClient();
                //ゲームIDを発行
                r.incr(redis_nextid_key,(err: any,result: number)=>{
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
                        hidden: metadata.hidden,
                        created: now,
                        playcount: 0,
                        updated: now
                    };
                    //DBに保存
                    collg.insertOne(game,(err)=>{
                        if(err){
                            logger.warning("Game id: "+newid+" is missing");
                            logger.error(err);
                            callback(err,null);
                            return;
                        }
                        collm.insertOne(metadataobj,(err)=>{
                            if(err){
                                //やばい！！！！！！！gameだけ入った！！！！！！！！
                                logger.warning("Game id: "+newid+" is missing");
                                logger.error(err);
                                collg.deleteOne({
                                    id: newid
                                },(err2)=>{
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
            if(err || collg == null){
                callback(err);
                return;
            }
            this.getMetadataCollection((err,collm)=>{
                if(err || collm == null){
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
                            hidden: metadata.hidden,
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
                            if(err || collp == null){
                                callback(err);
                                return;
                            }
                            collp.insertOne(pastdata,(err)=>{
                                if(err){
                                    logger.error(err);
                                    callback(err);
                                    return;
                                }
                                //そして本命の変更
                                collg.replaceOne({id},game,(err)=>{
                                    if(err){
                                        logger.error(err);
                                        callback(err);
                                        return;
                                    }
                                    collm.replaceOne({id},newMetadata,(err)=>{
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
            if(err || coll == null){
                callback(err,null);
                return;
            }
            var q:any={};
            if(query.owner!=null){
                q.owner=query.owner;
            }
            if(query.tags!=null){
                q.tags=query.tags;
            }
            if(query.ids!=null){
                q.id={
                    $in: query.ids
                };
            }
            if(query.hidden!=null){
                q.hidden=query.hidden;
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
            cursor.toArray((err,docs:Array<GameMetadata>)=>{
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
            if(err || coll == null){
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
    replaceResource(oldid:string,newid:string | null,callback:Cont):void{
        this.getGameCollection((err,coll)=>{
            if(err || coll == null){
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
            },op,(err)=>{
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
    addPlayCount(metadata:GameMetadata,callbackn?:Callback<number>):void{
        const callback = callbackn != null ? callbackn : ()=>{};
        var id=metadata.id;
        var r=this.db.redis.getClient();
        //ゲームの閲覧数
        var key:string=redis_playcount_prefix+id;
        r.incr(key,(err: any,result: number)=>{
            if(err){
                logger.error(err);
                callback(err,null);
                return;
            }
            if(result<=1){
                //resultが1だったら何か怪しい（消えてるのでは？）
                //DBからリストアする
                this.getMetadataCollection((err,coll)=>{
                    if(err || coll == null){
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
                    if(err || coll == null){
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
                    },(err)=>{
                        if(err){
                            logger.error(err);
                        }
                    });
                });
            }else{
                callback(null,result);
            }
        });
        //タグのランキングを増やす（12時間くぎりで）
        if(Array.isArray(metadata.tags)){
            key = redis_tagscore_prefix+((new Date()).getHours()<12 ? "0" : "1");
            for(var i=0;i<metadata.tags.length;i++){
                r.zincrby(key,1,metadata.tags[i]);
            }
        }
    }
    //人気のタグを取得する
    //num: 最大件数
    getPopularTags(num:number,callback:Callback<Array<string>>):void{
        var r=this.db.redis.getClient();
        //2つのsorted setから取得
        var next:(err:any,result:Array<string>)=>void;

        var cnt:number=0;
        var tagtable:any={};
        var tags:Array<{tag:string;score:number}>=[];
        next=(err:any,result:Array<string>)=>{
            //arrayにはtagとscoreが順に入っている
            if(err){
                logger.error(err);
                if(cnt>=0){
                    callback(err,null);
                    //2回エラーを送らないように
                    cnt=-1;
                }
                return;
            }
            if(cnt<0){
                return;
            }
            cnt++;
            for(var i=0;i<result.length;i+=2){
                if(tagtable[result[i]]){
                    tagtable[result[i]].score+=Number(result[i+1]);
                }else{
                    let t=tagtable[result[i]]={
                        tag: result[i],
                        score: Number(result[i+1])
                    };
                    tags.push(t);
                }
            }
            if(cnt<2){
                return;
            }
            //結果が出揃ったので集計する（再ソート）
            tags.sort((a,b)=>{
                return b.score-a.score;
            });
            callback(null,tags.map(obj=>obj.tag));
        };

        r.zrevrange([redis_tagscore_prefix+"0",0,num-1,"WITHSCORES"],next);
        r.zrevrange([redis_tagscore_prefix+"1",0,num-1,"WITHSCORES"],next);
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

