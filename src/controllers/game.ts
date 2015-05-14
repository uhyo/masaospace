///<reference path="../node.d.ts" />
import domain=require('domain');

import db=require('../db');
import logger=require('../logger');
import config=require('config');

import {GameMetadata, GameData} from '../data';

export default class GameController{
    constructor(private db:db.DBAccess){
    }
    init(callback:Cont):void{
        var d=domain.create();
        d.on("error",(err:any)=>{
            logger.critical(err);
            callback(err);
        });

        //indexes
        this.db.mongo.collection(config.get("mongodb.collection.gamematadata"),d.intercept((coll)=>{
            coll.createIndex({
                id:1
            },{
                unique:true
            },d.intercept((result)=>{
                coll.createIndex({
                    owner:1,
                    created:1
                },{
                },d.intercept((result)=>{
                    coll.createIndex({
                        created:1
                    },{
                    },d.intercept((result)=>{
                        //gamedata index
                        this.db.mongo.collection(config.get("mongodb.collection.gamedata"),d.intercept((coll)=>{
                            coll.createIndex({
                                id:1
                            },{
                                unique:1
                            },d.intercept((result)=>{
                                callback(null);
                            }));
                        }));
                    }));
                }));
            }));
        }));
    }
}

