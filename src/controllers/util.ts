//utility
import config=require('config');
import extend=require('extend');

import db=require('../db');
import logger=require('../logger');

import {outUserData} from '../util';
import {UserOpenData} from '../data';

//docsの各docにuserデータを付加してあげる
export function addUserData(db:db.DBAccess,docs:Array<any>,userfield:string,callback:Callback<Array<{user:UserOpenData}>>):void{
    db.mongo.collection(config.get("mongodb.collection.user"),(err,coll)=>{
        if(err || coll == null){
            logger.error(err);
            callback(err,null);
            return;
        }
        //idを列挙する
        var ids:Array<string>=docs.map(obj=>obj[userfield]);
        //ユーザーを探す
        coll.find({
            id:{
                $in: ids
            }
        }).toArray((err,users:Array<any>)=>{
            if(err){
                logger.error(err);
                callback(err,null);
                return;
            }
            //探してきたユーザーを割り当てる

            var dict=<{[id:string]:UserOpenData}>{};
            for(var i=0,l=users.length;i<l;i++){
                let obj=users[i];
                dict[obj.id]=outUserData(obj.data);
            }
            //docsに付加する
            var docs2:Array<any> = docs.map((obj)=>{
                return extend(obj,{user:dict[obj[userfield]]});
            });
            //OK
            callback(null,docs2);
        });
    });
}
