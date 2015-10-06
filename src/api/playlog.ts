///<reference path="../node.d.ts" />
import express=require('express');
import Controller=require('../controllers/index');

import zlib=require('zlib');

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
                c.playlog.newPlaylog(game, {
                    owner: req.session.user,
                    dataBase64: req.body.data
                },(err,id)=>{
                    if(err){
                        res.json({
                            error: String(err)
                        });
                        return;
                    }
                    //OK
                    res.json({
                        id
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
                //binはgzipされている
                if(req.acceptsEncodings("gzip")!==false){
                    //gzipをacceptするのでこのまま流す
                    res.set("Content-Encoding","gzip");
                    res.send(bin.read(0,bin.length()));
                    res.end();
                }else{
                    //gzipをサポートしていないのでこちらがわで解凍する必要がある
                    let g=zlib.createGunzip();
                    g.pipe(res);
                    g.write(bin.read(0,bin.length()));
                    g.end();
                }
            });
        });
    }
}

export = C;

