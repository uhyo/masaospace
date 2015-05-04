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
            this.db.mongo.collection(config.get("mongo.collection.file"),(err,coll)=>{
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
        this.db.mongo.collection(config.get("mongo.collection.file"),(err,coll)=>{
            if(err){
                callback(err,null);
                return;
            }
            var baseid=uniqueToken(config.get("file.idLength"));
            //新しいファイル名をつくる
            var id=baseid+"."+mime.extension(fi.type);
            var fi:File={
                id:id,
                type: f.type,
                owner: f.owner,
                name: f.name,
                created: f.created
            };
            //directory to place file
            var dir:string=path.join(config.get("file.path"),fi.owner);
            mkdirp(dir,(err)=>{
                if(err){
                    logger.error(err);
                    //入力ファイルの処理を試みる
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
                fs.rename(filepath,path.join(dir,id),(err)=>{
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
    getFiles(q:FileQuery,callback:Callback<Array<File>>):void{
        this.db.mongo.collection(config.get("mongo.collection.file"),(err,coll)=>{
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

}
