import * as nodemailer from 'nodemailer';

import * as db from '../db';
import * as logger from '../logger';
import * as config from 'config';

import {uniqueToken, secondToString} from '../util';

import {
    User,
    Mail,
    UserData,
} from '../data';
import {
    UserData as MUserData,
} from 'my-user-mongo';

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
    userEntryMail(u:User<MUserData<UserData>>, ticket:string):void{
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
            text: "以下のURLにアクセスすると"+sname+"への登録が完了します。\n"+
                "URLの有効期間は発行されてから"+secondToString(config.get("ticket.life"))+"です。\n\n"+
                addr+"\n\n"+
                "----------\n"+
                "このメールに心当たりが無い場合：\n"+
                "誰かがあなたのメールアドレスを勝手に入力しました。\n"+
                "このメールを無視すればあなたのメールアドレスが"+sname+"の登録に利用されることはありません。",
        });
    }
    //メールアドレス変更手続きメール
    changeMailMail(u:User<MUserData<UserData>>, newmail:string, ticket:string):void{
        var d=u.getData();
        var sname=config.get("service.name");
        var addr=config.get("service.url")+"my/ticket/"+ticket;
        this.send({
            type: "changemail",
            to: {
                name: d.name,
                address: newmail
            },
            subject: `${sname} 登録メールアドレス変更手続`,
            text: "以下のリンクにアクセスすると"+d.name+"さん("+d.screen_name+")のメールアドレスの変更が完了します。\n"+
                "URLの有効期間は発行されてから"+secondToString(config.get("ticket.life"))+"です。\n\n"+
                addr+"\n\n"+
                "----------\n"+
                "このメールに心当たりが無い場合：\n"+
                "誰かがあなたのメールアドレスを勝手に入力しました。\n"+
                "このメールを無視すればあなたのメールアドレスが"+sname+"の登録に利用されることはありません。",
        });
    }
    resetPasswordMail(u:User<MUserData<UserData>>, ticket:string):void{
        var d=u.getData();
        var sname=config.get("service.name");
        var addr=config.get("service.url")+"my/ticket/"+ticket;
        this.send({
            type: "resetpassword",
            to: {
                name: d.name,
                address: d.mail
            },
            subject: `${sname} パスワード再発行メール`,
            text: "以下のリンクにアクセスすると"+d.name+"さん("+d.screen_name+")の新しいパスワードが発行され、古いパスワードは無効になります。\n"+
                "URLの有効期間は発行されてから"+secondToString(config.get("ticket.life"))+"です。\n\n"+
                addr+"\n\n"+
                "----------\n"+
                "このメールに心当たりが無い場合：\n"+
                "誰かがあなたのユーザーIDかメールアドレスを勝手に入力しました。\n"+
                "このメールを無視すればあなたのパスワードが変更されることはありません。\n",
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
        this.transporter.sendMail(m,callback || (()=>{}));
        //メールをDBに保存
        this.getCollection((err,coll)=>{
            if(err || coll == null){
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
