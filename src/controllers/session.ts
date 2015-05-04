///<reference path="../node.d.ts" />

import db=require('../db');
import logger=require('../logger');

import {User, UserOneQuery} from '../data';
import mum=require('my-user-mongo');

export default class SessionController{
    constructor(private db:db.DBAccess,private user:mum.Manager){
    }
    init(callback:Cont):void{
        callback(null);
    }
    //ユーザーがログインを試みる
    login(u:UserOneQuery,password:string,callback:Callback<boolean>):void{
        //trueならログイン成功
        var query:any={}, flag=false;
        if(u.screen_name_lower!=null){
            query["data.screen_name_lower"]=u.screen_name_lower;
            flag=true;
        }
        if(u.mail!=null){
            query["data.mail"]=u.mail;
            flag=true;
        }
        if(flag===false){
            logger.warning("Invalid login query");
            callback("Invalid login query",false);
            return;
        }
        this.user.user.findOneUser(query,(err,u)=>{
            if(err){
                logger.error(err);
                callback(err,false);
                return;
            }
            if(u==null){
                // no such user
                callback(null,false);
                return;
            }
            //got user
            callback(null,u.auth(password));
        });
    }
}
