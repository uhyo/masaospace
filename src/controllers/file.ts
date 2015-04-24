///<reference path="../node.d.ts" />
// file uploading module
import fs=require('fs');
import path=require('path');

import mkdirp=require('mkdirp');

import config=require('config');
import logger=require('../logger');

import db=require('../db');

import {File} from '../data';

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
}
