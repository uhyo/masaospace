///<reference path="../node.d.ts" />
import express=require('express');
import Controller from '../controllers/index';

import logger=require('../logger');
// import validator=require('../validator');

// import config=require('config');

import util=require('../util');

import {
    Comment,
    CommentQuery,
    Playlog,
} from '../data';

class C{
    route(router:express.Router,c:Controller):void{
        // コメントを投稿する
        // IN game:number ゲームID
        // IN comment: 文字列
        // IN playlog?: プレイログ(Base64 encoded)
        // OUT id: 新しいコメントのid
        router.post("/new",util.apim.useUser,(req,res)=>{
            req.validateBody("game").isInteger();
            req.validateBody("comment").isComment();

            if(req.validationErrorResponse(res)){
                return;
            }
            var gameid:number=parseInt(req.body.game);
            //ゲームが存在するか確かめる
            c.game.getGame(gameid,false,(err,obj)=>{
                if(err){
                    res.json({
                        error: String(err)
                    });
                    return;
                }
                if(obj==null){
                    res.json({
                        error: "そのゲームは存在しません。"
                    });
                    return;
                }
                //あるみたいなので処理をすすめる（たぶん消えないでしょ）
                (req.body.playlog!=null ? (callback:Callback<Playlog>)=>{
                    c.playlog.newPlaylog(obj.game,{
                        owner: req.session!.user,
                        dataBase64: req.body.playlog
                    },(err,plid)=>{
                        callback(err,plid);
                    });
                }  : (callback: Callback<Playlog>)=>{
                    //プレイログがない場合はとにかく進める
                    callback(null,null);
                })((err,pl:Playlog)=>{
                    if(err){
                        res.json({
                            error: String(err)
                        });
                        return;
                    }
                    var commentobj:Comment;
                    if(pl!=null){
                        //プレイログがある
                        commentobj = {
                            id: Number.NaN,
                            game: gameid,
                            userid: req.session!.user,
                            gameowner: obj.metadata.owner,
                            comment: req.body.comment,
                            playlog: pl.id,
                            cleared: pl.cleared,
                            stage: pl.stage,
                            score: pl.score,
                            time: new Date()
                        };
                    }else{
                        //プレイログがない
                        commentobj = {
                            id: Number.NaN,
                            game: gameid,
                            userid: req.session!.user,
                            gameowner: obj.metadata.owner,
                            comment: req.body.comment,
                            playlog: null,
                            cleared: false,
                            stage: 0,
                            score: 0,
                            time: new Date()
                        };
                    }
                    c.comment.newComment(commentobj,(err,newid:number)=>{
                        if(err){
                            if(pl!=null){
                                logger.warning("Playlog id: "+pl.id+" isfloating");
                            }
                            res.json({
                                error:String(err)
                            });
                            return;
                        }
                        //できた
                        res.json({
                            id: newid
                        });
                    });
                });
            });
        });

        //コメントを列挙する（playlog情報も追加）
        //IN page?: 何個か
        //IN limit?: 最大何個
        //IN sort: "new" / "score"  ソート方法
        router.post("/find",(req,res)=>{
            req.validateBody("page").isInteger().optional();
            req.validateBody("limit").isInteger().optional();

            if(req.validationErrorResponse(res)){
                return;
            }
            var skip=parseInt(req.body.skip) || 0,
                limit=parseInt(req.body.limit) || 10;
            if(limit>50){
                limit=50;
            }
            var sortmode = req.body.sort;
            var sort;
            if(sortmode==="score"){
                //スコア順
                sort={score:-1,cleared:-1};
            }else{
                //新着順
                sort={id:-1};
            }


            var qu:CommentQuery={
                skip:skip,
                limit:limit,
                sort
            };

            if(isFinite(req.body.game)){
                qu.game=parseInt(req.body.game);
            }
            if(req.body.userid!=null){
                qu.userid=req.body.userid;
            }

            c.comment.findComments(qu,(err,docs)=>{
                if(err || docs == null){
                    res.json({
                        error: String(err)
                    });
                    return;
                }
                c.comment.addUserData(docs,(err,docs)=>{
                    if(err){
                        res.json({
                            error: String(err)
                        });
                        return;
                    }
                    res.json({
                        comments: docs
                    });
                });
            });
        });
    }
}

export = C;

