///<reference path="../node.d.ts" />
import db=require('../db');
import config=require('config');
import logger=require('../logger');

import {uniqueToken} from '../util';


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
    //新しいticketを発行
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
            var token=uniqueToken(config.get("ticket.length"));
            //Ticketを作る
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
    //チケットがあるか調べる
    findTicket(token:string,callback:Callback<Ticket>):void{
        this.getCollection((err,coll)=>{
            if(err){
                callback(err,null);
                return;
            }
            coll.findOne({token:token},(err,doc)=>{
                if(err){
                    logger.error(err);
                    return;
                }
                callback(null,doc || null);
            });
        });
    }
    //チケットを消す
    removeTicket(token:string,callback:Cont):void{
        this.getCollection((err,coll)=>{
            if(err){
                callback(err);
                return;
            }
            coll.deleteOne({token:token},(err,result)=>{
                if(err){
                    logger.error(err);
                    return;
                }
                callback(null);
            });
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
