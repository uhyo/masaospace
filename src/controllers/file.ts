///<reference path="../node.d.ts" />
// file uploading module
import fs=require('fs');
import path=require('path');

import mkdirp=require('mkdirp');
import mime=require('mime');

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
        //add file to db
        this.getCollection((err,coll)=>{
            if(err){
                callback(err,null);
                return;
            }
            var baseid=uniqueToken(config.get("file.idLength"));
            //新しいファイル名をつくる
            var id=baseid+"."+mime.extension(f.type);
            var fi:File={
                id:id,
                type: f.type,
                owner: f.owner,
                usage: f.usage,
                name: f.name,
                description: f.description,
                size: f.size,
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
            coll.find(q).toArray((err,docs)=>{
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
