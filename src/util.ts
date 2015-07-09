///<reference path="./node.d.ts" />
import randomString=require('random-string');
//some utils

export function uniqueToken(length:number):string{
    //2057年くらいまではDate.now().toString(36)は8桁
    if(length<=8){
        return Date.now().toString(36).slice(-length);
    }else{
        return randomString({length: length-8})+Date.now().toString(36).slice(-8);
    }
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
