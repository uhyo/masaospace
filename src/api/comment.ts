///<reference path="../node.d.ts" />
import express=require('express');
import Controller=require('../controllers/index');

import logger=require('../logger');
import validator=require('../validator');

import config=require('config');

import util=require('../util');

import {Comment, CommentWithUserData, CommentQuery} from '../data';

class C{
    route(router:express._Router,c:Controller):void{
        // コメントを投稿する
        // IN game:number ゲームID
        // IN comment: 文字列
        // OUT id: 新しいコメントのid
        router.post("/new",util.apim.useUser,(req,res)=>{
            req.validateBody("game").isInteger();
            req.validateBody("comment").isComment();

            if(req.validationErrorResponse(res)){
                return;
            }
            var gameid:number=parseInt(req.body.game);
            //ゲームが存在するか確かめる
            c.game.existsGame(gameid,(err,exists)=>{
                if(err){
                    res.json({
                        error: String(err)
                    });
                    return;
                }
                if(exists===false){
                    res.json({
                        error: "そのゲームは存在しません。"
                    });
                    return;
                }
                //あるみたいなので処理をすすめる（たぶん消えないでしょ）
                var commentobj:Comment = {
                    id: null,
                    game: gameid,
                    userid: req.session.user,
                    comment: req.body.comment,
                    time: new Date()
                };
                c.comment.newComment(commentobj,(err,newid:number)=>{
                    if(err){
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

        //コメントを列挙する
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


            var qu:CommentQuery={
                skip:skip,
                limit:limit,
                sort:{id:-1}
            };

            if(isFinite(req.body.game)){
                qu.game=parseInt(req.body.game);
            }
            if(req.body.userid!=null){
                qu.userid=req.body.userid;
            }

            c.comment.findComments(qu,(err,docs)=>{
                if(err){
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

