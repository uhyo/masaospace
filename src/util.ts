///<reference path="./node.d.ts" />
import randomString=require('random-string');
import cron=require('cron');
//some utils

import {UserData, UserOpenData, Session} from './data';

export function uniqueToken(length:number):string{
    //2057年くらいまではDate.now().toString(36)は8桁
    if(length<=8){
        return Date.now().toString(36).slice(-length);
    }else{
        return randomString({length: length-8})+Date.now().toString(36).slice(-8);
    }
}

//extract user info from session
export function writeUserInfo(session:Session,obj?:any):any{
    if(obj==null){
        obj={};
    }
    obj.user=session.user;
    obj.screen_name=session.screen_name;
    obj.name=session.name;
    return obj;
}
//外に出していいユーザー情報
export function outUserData(data:UserData):UserOpenData{
    return {
        screen_name: data.screen_name,
        name: data.name
    };
}

//cronに登録する
export function addDailyJob(job:()=>void,hour:number=3):void{
    new cron.CronJob("0 0 "+hour+" * * *",()=>{
        job();
    },null,true,"Asia/Tokyo");
}


// api middleware
export module apim{
    export function useUser(req,res,next){
        //ログインしていなかったらエラー
        if(req.session.user==null){
            res.json({
                error: "ログインしていません。"
            });
            return;
        }else{
            next();
        }
    }
}
