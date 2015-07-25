///<reference path="../node.d.ts" />
import express=require('express');
import Controller=require('../controllers/index');

import masao=require('../masao');
import logger=require('../logger');
import validator=require('../validator');

import config=require('config');

import util=require('../util');

import {GameMetadata, GameData, GameQuery} from '../data';

class C{
    route(router:express._Router,c:Controller):void{
        // ゲームを投稿する
        // IN game: ゲームのJSON表現
        // IN metadata: メタデータのJSON表現(title,description)
        // OUT id: 新しいゲームのid
        router.post("/new",util.apim.useUser,(req,res)=>{
            var game:GameData, metadata:GameMetadata;
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
            //ゲームをバリデートする
            if(game==null || metadata==null){
                res.json({
                    error: "ゲーム情報が不正です。"
                });
                return;
            }
            if(!masao.validateParams(game.params) || !masao.validateVersion(game.version)){
                res.json({
                    error: "ゲーム情報が不正です。"
                });
                return;
            }
            //メタ情報のバリデーション
            if(validator.funcs.isGameTitle(metadata.title)!=null || validator.funcs.isGameDescription(metadata.description)!=null){
                res.json({
                    error: "ゲーム情報が不正です。"
                });
                return;
            }
            //リソース情報を除去
            masao.removeResources(game.params);
            
            //TODO: 現在はとりあえずリソース空
            var gameobj:GameData = {
                id: null,
                version: game.version,
                params: game.params,
                resources: []
            };
            var now=new Date();
            var metadataobj: GameMetadata = {
                id: null,
                owner: req.session.user,
                title: metadata.title,
                description: metadata.description,
                created: now,
                updated: now
            };

            c.game.newGame(gameobj,metadataobj,(err,newid:number)=>{
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
                limit=parseInt(req.body.limit) || 10;
            if(limit>50){
                limit=50;
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
