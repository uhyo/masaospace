///<reference path="../node.d.ts" />
import express=require('express');
import Controller=require('../controllers/index');

import masao=require('../../lib/masao');
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
            if(!masao.validateParams(game.params) || !masao.validateVersion(game.version) || !Array.isArray(game.resources)){
                res.json({
                    error: "ゲーム情報が不正です。"
                });
                return;
            }
            //メタ情報のバリデーション
            if(!validateMetadata(metadata)){
                res.json({
                    error: "ゲーム情報が不正です。"
                });
                return;
            }
            //リソース情報を除去
            masao.removeResources(game.params);
            
            //リソースがあるか確認する
            var resourceTargetFlag:boolean = false;
            var resourceIds=game.resources.map((obj)=>{
                if(obj==null){
                    resourceTargetFlag=true;
                    return null;
                }
                if(!(obj.target in masao.resources)){
                    //そんなリソースはない
                    resourceTargetFlag=true;
                    return null;
                }
                if("string"!==typeof obj.id){
                    resourceTargetFlag=true;
                    return null;
                }
                return obj.id;
            });
            if(resourceTargetFlag===true){
                //resourcesデータにまずいところがあった
                res.json({
                    error: "ゲーム情報が不正です。"
                });
                return;
            }
            c.file.getFiles({
                ids: resourceIds,
                owner: req.session.user
            },(err,files)=>{
                if(err){
                    res.json({
                        error: String(err)
                    });
                    return;
                }
                //ファイルが全部存在するか調べる
                var table:any={};
                for(var i=0;i<files.length;i++){
                    table[files[i].id]=true;
                }
                for(var i=0;i<resourceIds.length;i++){
                    if(table[resourceIds[i]]!==true){
                        //!?
                        res.json({
                            error: "ゲーム情報が不正です。"
                        });
                        return;
                    }
                }
                //ファイルはOKだ
                var gameobj:GameData = {
                    id: null,
                    version: game.version,
                    params: game.params,
                    resources: game.resources.map((obj)=>{
                        return {
                            target: obj.target,
                            id: obj.id
                        };
                    })
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
        });
        //ゲームに修正をかける
        router.post("/edit",util.apim.useUser,(req,res)=>{
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
            if(!validateMetadata(metadata)){
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
                created: null,
                updated: now
            };

            c.game.editGame(parseInt(req.body.id), req.session.user, gameobj, metadataobj,(err)=>{
                if(err){
                    res.json({
                        error: String(err)
                    });
                }else{
                    res.json({
                        success:true
                    });
                }
            });
        });

        //ゲームを読む
        //IN: id (number)
        //OUT: {game, metadata}
        router.post("/get",(req,res)=>{
            req.validateBody("id").isInteger();

            if(req.validationErrorResponse(res)){
                return;
            }

            c.game.getGame(parseInt(req.body.id),(err,obj)=>{
                if(err){
                    res.json({
                        error: String(err)
                    });
                    return;
                }
                if(obj==null){
                    res.json({
                        error: "そのゲームIDは存在しません。"
                    });
                }else{
                    res.json(obj);
                }
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

//だめだったらfalse
function validateMetadata(metadata:GameMetadata):boolean{
    if(validator.funcs.isGameTitle(metadata.title)!=null || validator.funcs.isGameDescription(metadata.description)!=null){
        return false;
    }
    return true;
}
