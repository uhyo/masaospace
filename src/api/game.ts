///<reference path="../node.d.ts" />
import express=require('express');
import Controller=require('../controllers/index');

import logger=require('../logger');

import config=require('config');

import {GameMetadata, GameData} from '../data';

class C{
    route(router:express._Router,c:Controller):void{
        // ゲームを投稿する
        router.post("/new",(req,res)=>{

        });
    }
}

export = C;
