///<reference path="../node.d.ts" />
import randomString=require('random-string');

import db=require('../db');
import config=require('config');
import logger=require('../logger');


import {TicketData, Ticket} from '../data';
//ticket controller
export default class TicketController{
    constructor(private db:db.DBAccess){

    }
    init(callback:Cont):void{
        //init dbs
        this.getCollection((err,coll)=>{
            if(err){
                callback(err);
                return;
            }
            //ensure ticket index
            coll.createIndex({
                token:1
            },{
                unique:true
            },(err,result)=>{
                if(err){
                    logger.critical(err);
                    callback(err);
                    return;
                }
                //TODO: it should check existing index to update ttl time
                coll.createIndex({
                    created:1
                },{
                    expireAfterSeconds:config.get("ticket.life.setpassword")
                },(err,result)=>{
                    if(err){
                        logger.critical(err);
                    }
                    callback(err);
                    return;
                });
            });
        });
    }
    newTicket(t:TicketData,callback:Callback<Ticket>):void{
        if(!this.checkTicket(t)){
            logger.error("Invalid ticket "+JSON.stringify(t));
            callback("Invalid ticket",null);
            return;
        }
        this.getCollection((err,coll)=>{
            if(err){
                callback(err,null);
                return;
            }
            //まずticket tokenを決定
            decideToken();

            function decideToken():void{
                var token=randomString({length: config.get("ticket.length")});
                coll.count({token: token},(err,count)=>{
                    if(err){
                        logger.error(err);
                        callback(err,null);
                        return;
                    }
                    //万が一重複したら再考
                    if(count>0){
                        decideToken();
                        return;
                    }
                    //重複なしを確認したら（これ以降はuniqueで止める）
                    var ti:Ticket={
                        token: token,
                        type: t.type,
                        user: t.user,
                        created:new Date()
                    };
                    coll.insertOne(ti,(err,result)=>{
                        if(err){
                            logger.error(err);
                            callback(err,null);
                            return;
                        }
                        //成功した
                        callback(null,ti);
                    });
                });
            }
        });
    }

    //コレクションを得る
    private getCollection(callback:Callback<db.Collection>):void{
        this.db.mongo.collection(config.get("mongodb.collection.ticket"),(err,col)=>{
            if(err){
                logger.critical(err);
                callback(err,null);
            }
            callback(null,col);
        });
    }
    //Ticketがvalidかどうかチェック
    private checkTicket(t:TicketData):boolean{
        //type check
        if(t.type!=="setpassword"){
            //undefined ticket type
            return false;
        }
        return true;
    }
}
