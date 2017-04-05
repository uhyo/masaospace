///<reference path="../node.d.ts" />
import * as express from 'express';
import * as multer from 'multer';

import Controller from '../controllers/index';


import {
    masao,
} from '@uhyo/masaospace-util';

import * as config from 'config';

import * as util from '../util';

import {File, FileData, FileQuery} from '../data';

export default class C{
    route(router:express.Router, c:Controller):void{
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
            if(!masao.validateResourceKind(req.body.usage)){
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
                owner: req.session!.user
            },(err,size)=>{
                if(err || size == null){
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
                    owner: req.session!.user,
                    name: req.body.name,
                    usage: req.body.usage,
                    description: req.body.description,
                    size: file.size,
                    created: new Date()
                };

                c.file.addFile(fd, file.path, (err,f)=>{
                    if(err || f == null){
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
        //ファイルのメタデータを変更
        //IN id: ファイルID
        //IN name: オリジナルのファイル名
        //IN type: ファイルのMIMEタイプ
        //IN usage: 用途
        //IN description: 説明
        router.post("/edit",util.apim.useUser,(req,res)=>{
            req.validateBody("name").length(config.get("filedata.name.maxLength"));
            req.validateBody("description").length(config.get("filedata.description.maxLength"));

            if(req.validationErrorResponse(res)){
                return;
            }
            if(!masao.validateResourceKind(req.body.usage)){
                res.json({
                    error: "ファイルタイプが不正です。"
                });
                return;
            }
            //まずファイルを取得
            c.file.getFiles({id: req.body.id, owner: req.session!.user},(err,files)=>{
                if(err || files == null){
                    res.json({
                        error: String(err)
                    });
                    return;
                }
                if(files.length===0){
                    res.json({
                        error: "ファイルが存在しません。"
                    });
                    return;
                }
                var file:File=files[0];
                //新しいデータを入れる
                file.type=req.body.type;
                file.name=req.body.name;
                file.usage=req.body.usage;
                file.description=req.body.description;

                c.file.saveFile(req.body.id, file, (err)=>{
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
        //ファイルを削除
        //IN id: ファイルID
        //OUT success: 成功したらtrue
        router.post("/del",util.apim.useUser,(req,res)=>{
            var id=req.body.id;
            //まずファイルが存在するか確認
            c.file.getFiles({id: id,owner:req.session!.user},(err,files)=>{
                if(err || files == null){
                    res.json({
                        error: String(err)
                    });
                    return;
                }
                if(files.length===0){
                    res.json({
                        error: "そのファイルは存在しません。"
                    });
                    return;
                }
                ("string"===typeof req.body.alternativeFile ? (callback:Cont)=>{
                    // alternativeFileが指定されている場合はこのファイルで置き換える
                    (req.body.alternativeFile ? (callback:Cont)=>{
                        //他のファイルで置き換える
                        c.file.getFiles({
                            id: req.body.alternativeFile,
                            owner: req.session!.user
                        },(err,files)=>{
                            if(err || files == null){
                                res.json({
                                    error: String(err)
                                });
                                return;
                            }
                            if(files.length===0){
                                res.json({
                                    error: "そのファイルは存在しません。"
                                });
                                return;
                            }
                            //ファイルの確認ができたので置き換える
                            c.game.replaceResource(id, req.body.alternativeFile,callback);
                        });
                    } : (callback:Cont)=>{
                        //ファイルをデフォルトで置き換える
                        c.game.replaceResource(id, null, callback);
                    })(callback);
                } : (callback:Cont)=>{
                    callback(null);
                })((err)=>{
                    if(err){
                        res.json({
                            error: String(err)
                        });
                        return;
                    }
                    //このファイルを使うゲームがないか確認
                    c.game.countResourceUsingGames(id,(err,num)=>{
                        if(err || num == null){
                            res.json({
                                error: String(err)
                            });
                            return;
                        }
                        if(num>0){
                            //削除できない
                            res.json({
                                success: false,
                                used: num
                            });
                        }else{
                            //削除できる
                            c.file.deleteFile(id,(err)=>{
                                if(err){
                                    res.json({
                                        error: String(err)
                                    });
                                    return;
                                }
                                res.json({
                                    success:true
                                });
                            });
                        }
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
