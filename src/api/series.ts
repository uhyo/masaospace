///<reference path="../node.d.ts" />
import express=require('express');
import Controller=require('../controllers/index');

import masao=require('../../lib/masao');
import logger=require('../logger');
import validator=require('../validator');

import config=require('config');

import util=require('../util');

import {Series, SeriesQuery} from '../data';

class C{
    route(router:express._Router,c:Controller):void{
        // シリーズを作成する
        // IN name: シリーズ名
        // IN description: 説明
        // OUT id: シリーズID
        router.post("/new",util.apim.useUser,(req,res)=>{
            req.validateBody("name").isSeriesName();
            req.validateBody("description").isSeriesDescription();

            if(req.validationErrorResponse(res)){
                return;
            }

            var now=new Date();
            c.series.newSeries({
                id: null,
                owner: req.session.user,
                name: req.body.name,
                description: req.body.description,
                games: [],
                created: now,
                updated: now
            },(err,newid)=>{
                if(err){
                    res.json({
                        error: String(err)
                    });
                    return;
                }
                //OK
                res.json({
                    id: newid
                });
            });
        });
        // シリーズを編集する
        // IN id: シリーズID
        // IN name: シリーズ名
        // IN description: 説明
        // IN games: ゲームIDを","で区切った文字列
        router.post("/save",util.apim.useUser,(req,res)=>{
            req.validateBody("id").isInteger();
            req.validateBody("name").isSeriesName();
            req.validateBody("description").isSeriesDescription();
            req.validateBody("games").isnotEmpty();
            if(req.validationErrorResponse(res)){
                return;
            }

            //該当のシリーズを探す
            c.series.findSeries({
                id: parseInt(req.body.id),
                owner: req.session.user,
            },(err,docs)=>{
                if(err){
                    res.json({
                        error: String(err)
                    });
                    return;
                }
                if(docs.length<1){
                    res.json({
                        error: "シリーズが見つかりません。"
                    });
                    return;
                }
                var series=docs[0];
                //ゲームを探す
                var gameids=req.body.games.split(",").map((id)=>{
                    return Number(id);
                });
                c.game.findGames({
                    owner: req.session.user,
                    ids: gameids
                },(err,metadatas)=>{
                    if(err){
                        res.json({
                            error: String(err)
                        });
                        return;
                    }
                    if(metadatas.length < gameids.length){
                        //足りない
                        res.json({
                            error: "ゲーム指定が不正です。"
                        });
                        return;
                    }
                    //OK シリーズを書き換える
                    c.series.updateSeries({
                        id: series.id,
                        owner: series.owner,
                        name: req.body.name,
                        description: req.body.description,
                        games: gameids,
                        created: series.created,
                        updated: new Date()
                    },(err)=>{
                        if(err){
                            res.json({
                                error: String(err)
                            });
                        }else{
                            res.json({
                                success: true
                            });
                        }
                    });
                });
            });
        });
        // シリーズを検索する
        // IN owner: オーナーのユーザーID
        // OUT series: シリーズたち
        router.post("/find",(req,res)=>{
            var qu:SeriesQuery={
                owner: req.body.owner
            };

            c.series.findSeries(qu,(err,docs)=>{
                if(err){
                    res.json({
                        error: String(err)
                    });
                    return;
                }
                res.json({
                    series: docs
                });
            });
        });
        // シリーズに属するゲームの一覧
        // IN series: シリーズID
        // OUT games: ゲームたち
        router.post("/games",(req,res)=>{
            var qu:SeriesQuery={
                id: Number(req.body.series),
                limit:1
            };
            c.series.findSeries(qu,(err,docs)=>{
                if(err){
                    res.json({
                        error: String(err)
                    });
                    return;
                }
                if(docs.length<1){
                    res.json({
                        error: "シリーズが見つかりませんでした。"
                    });
                    return;
                }
                var se=docs[0];
                c.game.findGames({
                    ids: se.games
                },(err,docs)=>{
                    if(err){
                        res.json({
                            error: String(err)
                        });
                        return;
                    }
                    res.json({
                        games: docs
                    });
                });
            });
        });
    }
}

export = C;
