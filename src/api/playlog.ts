///<reference path="../node.d.ts" />
import express=require('express');
import Controller=require('../controllers/index');

import logger=require('../logger');
import masao=require('../../lib/masao');

import config=require('config');

import util=require('../util');

import {Playlog, PlaylogQuery} from '../data';

class C{
    route(router:express._Router,c:Controller):void{
        //自分のプレイログをアップロードする
        //IN game:number ステージID
        //IN data:string Base64でのデータ
        //OUT id:string プレイログのID
        router.post("/new",util.apim.useUser,(req,res)=>{
            if(req.body.data==null){
                res.json({
                    error: "データが送信されていません。"
                });
                return;
            }
            //まずステージを調べる
            c.game.getGame(parseInt(req.body.game), false, (obj)=>{
                if(obj==null){
                    res.json({
                        error: "そのゲームは存在しません。"
                    });
                    return;
                }
                let game=obj.game;
                //データがvalidか確かめる
                let buf=new Buffer(req.body.data,"base64");
                let playlogobj;
                try{
                    playlogobj = masao.playlog.parse(buf);
                }catch(e){
                    res.json({
                        error: String(e)
                    });
                    return;
                }
                //scoreとstageが来た
                var now=new Date();
                //ステージあったのでplaylogを入れる
                c.playlog.newPlaylog({
                    id: null,
                    owner: req.session.user,
                    game: obj.game.id,
                    game_id: String(obj.game._id),
                    cleared: masao.getLastStage(game)===playlogobj.stage,
                    stage: playlogobj.stage,
                    score: playlogobj.score,
                    created: now,
                    data: buf
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
        });
        //プレイログをだす
        //IN id: プレイログのID
        router.post("/get",(req,res)=>{
            let id=req.body.id;
            if("string"!==typeof id){
                res.sendStatus(404);
                return;
            }
            c.playlog.findPlaylogs({
                id
            },(err,logs)=>{
                if(err){
                    res.status(500).end(err);
                    return;
                }
                if(logs.length===0){
                    res.sendStatus(404);
                    return;
                }
                //ログあった
                res.type("application/octet-stream");
                //logs[0].dataはBinary型
                let bin=logs[0].data;
                if(bin==null){
                    //???
                    res.sendStatus(404);
                    return;
                }
                res.send(bin.read(0,bin.length()));
                res.end();
            });
        });
    }
}

export = C;

