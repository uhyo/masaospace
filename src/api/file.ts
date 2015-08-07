///<reference path="../node.d.ts" />
import express=require('express');
import multer=require('multer');

import Controller=require('../controllers/index');


import masao=require('../../lib/masao');
import logger=require('../logger');
import validator=require('../validator');

import config=require('config');

import util=require('../util');

import {File, FileData, FileQuery} from '../data';

class C{
    route(router:express._Router,c:Controller):void{
        //ファイルをアップロード
        //IN file: ファイル
        //IN name: オリジナルのファイル名
        //IN type: ファイルのMIMEタイプ
        //IN usage: 用途
        //IN description: 説明
        //OUT id: ファイルID
        router.post("/upload",util.apim.useUser,multer({
            dest: config.get("file.temporary"),
            limits: {
                fileSize: config.get("filedata.maxSize")
            }
        }).single("file"),(req,res)=>{
            //validation
            req.validateBody("name").length(config.get("filedata.name.maxLength"));
            req.validateBody("description").length(config.get("filedata.description.maxLength"));

            if(req.validationErrorResponse(res)){
                return;
            }
            if(!masao.validateResourceKind(req.body.type)){
                res.json({
                    error: "ファイルタイプが不正です。"
                });
                return;
            }
            //TODO: MIMEタイプのバリデーション
            var file=req.file;
            if(file==null){
                res.json({
                    error: "ファイルを検出できませんでした。"
                });
                return;
            }

            //ファイルの合計サイズが制限を超えないか確かめる
            c.file.sumFileSize({
                owner: req.session.user
            },(err,size)=>{
                if(err){
                    res.json({
                        error: String(err)
                    });
                    return;
                }
                //TODO: クリティカルセクションじゃね？
                if(size+file.size >= config.get("filedata.diskSpace")){
                    //与えられた容量をオーバーしている
                    res.json({
                        error: "アカウントの空き容量が不足しています。"
                    });
                    return;
                }
                var fd:FileData = {
                    type: req.body.type,
                    owner: req.session.user,
                    name: req.body.name,
                    usage: req.body.usage,
                    description: req.body.description,
                    size: file.size,
                    created: new Date()
                };

                c.file.addFile(fd, file.path, (err,f)=>{
                    if(err){
                        res.json({
                            error: String(err)
                        });
                        return;
                    }
                    res.json({
                        id: f.id
                    });
                });
            });
        });
        //ファイルのリストを得る
        //IN owner: ファイルのもちぬし
        //IN usage: ファイルの種類
        //OUT files: ファイルオブジェクトの配列
        router.post("/list",(req,res)=>{
            var owner:string = req.body.owner, usage:string = req.body.usage;

            var q:FileQuery={};
            if("string"===typeof owner){
                q.owner=owner;
            }
            if("string"===typeof usage){
                q.usage=usage;
            }

            //ファイルを探す
            c.file.getFiles(q, (err,files:Array<File>)=>{
                if(err){
                    res.json({
                        error: String(err)
                    });
                    return;
                }
                res.json({
                    files: files
                });
            });
        });
    }
}

export = C;
