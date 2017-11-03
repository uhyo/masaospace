///<reference path="./node.d.ts" />
const randomString = require('random-string');
import * as cron from 'cron';
import * as config from 'config';

import {
    Request,
    Response,
} from 'express';
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
    obj.profile=session.profile;
    obj.icon=session.icon;
    obj.url=session.url;
    return obj;
}
//外に出していいユーザー情報
export function outUserData(data:UserData):UserOpenData{
    return {
        screen_name: data.screen_name,
        name: data.name,
        profile: data.profile,
        icon: data.icon,
        url: data.url
    };
}

//cronに登録する
export function addDailyJob(job:()=>void,hour:number=3):void{
    new cron.CronJob("0 0 "+hour+" * * *",()=>{
        job();
    },void 0,true,"Asia/Tokyo");
}

//秒数をJapaneseにする
export function secondToString(secs:number):string{
    var hours:number, minutes:number, seconds:number;
    hours=Math.floor(secs/3600), minutes=Math.floor((secs%3600)/60), seconds=secs%60;
    return `${hours ? hours+"時間" : ""}${minutes ? minutes+"分" : ""}${seconds ? seconds+"秒" : ""}`;
}

/**
 * ファイルIDを渡されたらそれをabstract URLにする
 */
export function abstractFileURL(fileid: string): string{
    return `${config.get('service.url')}uploaded/${fileid}`;
}


// api middleware
export module apim{
    export function useUser(req: Request,res: Response, next: ()=>void){
        //ログインしていなかったらエラー
        if(req.session == null || req.session.user==null){
            res.json({
                error: "ログインしていません。"
            });
            return;
        }else{
            next();
        }
    }
}
