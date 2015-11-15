///<reference path="../node.d.ts" />
// file uploading module
import fs=require('fs');
import path=require('path');

import mkdirp=require('mkdirp');
import mime=require('mime');
import md5file=require('md5-file');

import config=require('config');
import logger=require('../logger');

import db=require('../db');

import {File,FileData,FileQuery} from '../data';

import {uniqueToken} from '../util';

export default class FileController{
    constructor(private db:db.DBAccess){
    }
    init(callback:Cont):void{
        //first make directory to store files
        mkdirp(path.resolve(__dirname,"../../config",config.get("file.path")),(err:any)=>{
            if(err){
                logger.critical(err);
                callback(err);
                return;
            }
            //next prepare databases
            this.getCollection((err,coll)=>{
                if(err){
                    callback(err);
                    return;
                }
                coll.createIndex({
                    id:1
                },{
                    unique:true
                },(err,result)=>{
                    if(err){
                        logger.critical(err);
                        callback(err);
                        return;
                    }
                    coll.createIndex({
                        owner:1
                    },{
                    },(err,result)=>{
                        if(err){
                            logger.critical(err);
                            callback(err);
                            return;
                        }
                        callback(null);
                    });
                });
            });
        });
    }
    addFile(f:FileData,filepath:string,callback:Callback<File>):void{
        //ファイルタイプが問題ないか判定
        let typ_norm = mime.lookup(mime.extension(f.type)); //タイプをmime正規化
        if(typ_norm !== mime.lookup(f.name)){
            //ファイル名とタイプが一致しない
            callback("ファイル名とMIMEタイプが一致しません。", null);
            return;
        }
        let white_types:Array<string> = config.get("filedata.types");
        if(white_types.indexOf(typ_norm)===-1){
            //存在しなかった
            callback("その形式のファイルはアップロードできません。",null);
            return;
        }
        //add file to db
        this.getCollection((err,coll)=>{
            if(err){
                callback(err,null);
                return;
            }
            //まずmd5をとる
            md5file(filepath,(err,md5)=>{
                if(err){
                    logger.error(err);
                    callback(err,null);
                    return;
                }
                var baseid=uniqueToken(config.get("file.idLength"));
                //新しいファイル名をつくる
                var id=baseid+path.extname(f.name).toLowerCase();
                var fi:File={
                    id:id,
                    type: f.type,
                    owner: f.owner,
                    usage: f.usage,
                    name: f.name,
                    description: f.description,
                    size: f.size,
                    md5: md5,
                    created: f.created
                };
                var newpath = path.join(config.get("file.path"),id);
                fs.rename(filepath,newpath,(err)=>{
                    if(err){
                        logger.error(err);
                        fs.unlink(filepath,(err2)=>{
                            if(err2){
                                logger.error(err2);
                                callback(err2,null);
                                return;
                            }
                            callback(err,null);
                        });
                        return;
                    }
                    coll.insertOne(fi,(err,result)=>{
                        if(err){
                            logger.error(err);
                            fs.unlink(newpath,(err2)=>{
                                if(err2){
                                    logger.error(err2);
                                    callback(err2,null);
                                    return;
                                }
                                callback(err,null);
                            });
                            callback(err,null);
                            return;
                        }
                        //入った
                        callback(null,fi);
                    });
                });
            });
        });
    }
    //ファイルを書き換える
    saveFile(fileid:string,f:File,callback:Cont):void{
        this.getCollection((err,coll)=>{
            if(err){
                callback(err);
                return;
            }
            //念の為IDをセット
            f.id=fileid;
            coll.replaceOne({id: fileid},f,(err,result)=>{
                if(err){
                    logger.error(err);
                    callback(err);
                }else{
                    callback(null);
                }
            });
        });
    }
    //ファイルを消す
    deleteFile(id:string,callback:Cont):void{
        //まずDBから消す
        this.getCollection((err,coll)=>{
            if(err){
                callback(err);
                return;
            }
            coll.deleteOne({id},(err,result)=>{
                if(err){
                    callback(err);
                    return;
                }
                //次にファイルシステムから消す
                var p=path.join(config.get("file.path"),id);
                fs.unlink(p,(err)=>{
                    if(err){
                        logger.error(err);
                        logger.alert("fileid: "+id+" remains only in disk!");
                        callback(err);
                    }
                    //完了
                    callback(null);
                });
            });
        });
    }
    getFiles(q:FileQuery,callback:Callback<Array<File>>):void{
        if(Array.isArray(q.ids)){
            q.id = <any>{
                $in: q.ids
            };
            delete q.ids;
        }
        this.getCollection((err,coll)=>{
            if(err){
                callback(err,null);
                return;
            }
            coll.find(q).sort({
                created: -1
            }).toArray((err,docs)=>{
                if(err){
                    logger.error(err);
                    callback(err,[]);
                    return;
                }
                callback(null,docs);
            });
        });
    }
    //ファイルの合計サイズ
    sumFileSize(q:FileQuery,callback:Callback<number>):void{
        this.getCollection((err,coll)=>{
            coll.aggregate([
                {$match: q},
                {$project:{size:1}},
                {$group:{
                    "_id": "a",
                    "sum": {$sum: "$size"}
                }}
            ],(err,result)=>{
                if(err){
                    logger.error(err);
                    callback(err,null);
                    return;
                }
                if(result.length===0){
                    //何もなかった
                    callback(null,0);
                    return;
                }
                callback(null,result[0].sum);
            });
        });
    }
    //コレクションを得る
    private getCollection(callback:Callback<db.Collection>):void{
        this.db.mongo.collection(config.get("mongodb.collection.file"),(err,col)=>{
            if(err){
                logger.critical(err);
                callback(err,null);
            }
            callback(null,col);
        });
    }

}
