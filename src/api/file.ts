///<reference path="../node.d.ts" />
import express=require('express');
import Controller=require('../controllers/index');

import masao=require('../../lib/masao');
import logger=require('../logger');
import validator=require('../validator');

import config=require('config');

import util=require('../util');

import {File, FileData, FileQuery} from '../data';

class C{
    route(router:express._Router,c:Controller):void{
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
