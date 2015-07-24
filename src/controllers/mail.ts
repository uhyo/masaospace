///<reference path="../node.d.ts" />

import nodemailer=require('nodemailer');

import db=require('../db');
import logger=require('../logger');
import config=require('config');

import {uniqueToken} from '../util';

import {User,Mail} from '../data';

export default class MailController{
    private transporter:nodemailer.Transport;
    constructor(private db:db.DBAccess){
    }
    init(callback:Cont):void{
        this.transporter = nodemailer.createTransport({
            //SMTP transport
            host:"localhost",
            tls:{
                rejectUnauthorized:false
            }
        });
        callback(null);
    }

    //ユーザー登録時のメール
    userEntryMail(u:User, ticket:string):void{
        var d=u.getData();
        var sname=config.get("service.name");
        var addr=config.get("service.url")+"entry/ticket/"+d.screen_name+"/"+ticket;
        this.send({
            type: "entry",
            to: {
                name: d.name,
                address: d.mail
            },
            subject: `${sname} 登録手続きメール`,
            text: "以下のリンクにアクセスすると"+sname+"への登録が完了します。\n\n"+
                addr+"\n\n"+
                "----------\n"+
                "このメールに心当たりが無い場合：\n"+
                "誰かがあなたのメールアドレスを勝手に入力しました。\n"+
                "このメールを無視すればあなたのメールアドレスが"+sname+"の登録に利用されることはありません。",
        });
    }

    //テキストをメールな感じにする
    private modifyText(text:string):string{
        var sname=config.get("service.name");
        return text+"\n\n"
        +"----------\n"
        +"このメールは"+sname+"システムによる自動送信です。\n"
        +"返信できませんのでご注意ください。\n\n"
        +sname+"\n"
        +config.get("service.url")+"\n";
    }
    //messageidを作る
    private generateMessageId(type:string):string{
        return type+"-"+uniqueToken(20)+"@"+config.get("service.domain");
    }
    //send mail
    private send(mail:Mail,callback?:Cont):void{
        //いろいろ追加する
        var m:nodemailer.Mail = {
            from: {
                name: config.get("service.name"),
                address: config.get("service.mail")
            },
            to: mail.to,
            subject: mail.subject,
            text: this.modifyText(mail.text),
            messageId: this.generateMessageId(mail.type)
        };
        this.transporter.sendMail(m,callback);
        //メールをDBに保存
        this.getCollection((err,coll)=>{
            if(err){
                logger.error(err);
                return;
            }
            coll.insertOne(m,(err,_)=>{
                if(err){
                    logger.error(err);
                }
            });
        });
    }
    private getCollection(callback:Callback<db.Collection>):void{
        this.db.mongo.collection(config.get("mongodb.collection.mail"),(err,col)=>{
            if(err){
                logger.critical(err);
                callback(err,null);
            }
            callback(null,col);
        });
    }
}