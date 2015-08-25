///<reference path="../node.d.ts" />
import express=require('express');
import Controller=require('../controllers/index');

import masao=require('../../lib/masao');
import logger=require('../logger');
import validator=require('../validator');

import config=require('config');

import util=require('../util');

import {Series, SeriesQuery} from '../data';

class C{
    route(router:express._Router,c:Controller):void{
        // シリーズを検索する
        // IN owner: オーナーのユーザーID
        // OUT series: シリーズたち
        router.post("/find",(req,res)=>{
            var qu:SeriesQuery={
                owner: req.body.owner
            };

            c.series.findSeries(qu,(err,docs)=>{
                if(err){
                    res.json({
                        error: String(err)
                    });
                    return;
                }
                res.json({
                    series: docs
                });
            });
        });
    }
}

export = C;
