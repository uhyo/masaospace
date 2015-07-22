///<reference path="../node.d.ts" />
import express=require('express');
import Controller=require('../controllers/index');

import logger=require('../logger');

import config=require('config');

import util=require('../util');

import {GameMetadata, GameData, GameQuery} from '../data';

class C{
    route(router:express._Router,c:Controller):void{
        // ゲームを投稿する
        // IN game: ゲームのJSON表現
        // IN metadata: メタデータのJSON表現(title,level,description)
        // OUT id: 新しいゲームのid
        router.post("/new",util.apim.useUser,(req,res)=>{
            var game, metadata;
            //JSONを読む
            try{
                game=JSON.parse(req.body.game);
                metadata=JSON.parse(req.body.metadata);
            }catch(e){
                res.json({
                    error:String(e)
                });
                return;
            }
            //TODO: ゲームをバリデートする
            //メタ情報を付加
            metadata.owner=req.session.user;
            metadata.created=metadata.updated=new Date();
            c.game.newGame(game,metadata,(err,newid:number)=>{
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

        //ゲームを探す
        router.post("/find",(req,res)=>{
            req.validateBody("page").isInteger().optional();
            req.validateBody("limit").isInteger().optional();

            if(req.validationErrorResponse(res)){
                return;
            }
            var skip=parseInt(req.body.skip) || 0,
                limit=parseInt(req.body.limit) || 50;
            if(limit>100){
                limit=100;
            }


            var qu:GameQuery={
                skip:skip,
                limit:limit,
                sort:{id:-1}
            };

            if(req.body.owner!=null){
                qu.owner=req.body.owner;
            }

            c.game.findGames(qu,(err,docs)=>{
                if(err){
                    res.json({
                        error: String(err)
                    });
                    return;
                }
                c.game.addUserData(docs,(err,docs)=>{
                    if(err){
                        res.json({
                            error: String(err)
                        });
                        return;
                    }
                    res.json({
                        metadatas: docs
                    });
                });
            });


        });
    }
}

export = C;
