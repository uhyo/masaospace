///<reference path="./data.d.ts" />
import Controller=require('../controllers/index');

import config=require('config');

export default function(c:Controller,r:_Router):void{
    //about game

    /////play
    r.add("/play/:number",(obj,callback:Callback<View>)=>{
        c.game.getGame(parseInt(obj[":number"]),(err,obj)=>{
            if(err){
                callback(err,null);
                return;
            }
            if(obj==null){
                //そんなゲームはないね
                callback("お探しの正男は見つかりませんでした。",null);
                return;
            }
            callback(null,{
                title: obj.metadata.title,
                page: "game.play",
                data:{
                    game: obj.game,
                    metadata: obj.metadata,
                }
            });
        });
    });
    /////list
    r.add("/game/list",(obj,callback:Callback<View>)=>{
        //検索条件をアレする
        callback(null,{
            title: "検索結果",
            page: "game.list",
            data:{
                owner: obj.owner
            }
        });
    });

    /////game管理
    r.add("/game/new",(obj,callback:Callback<View>)=>{
        //新しいゲームを投稿
        callback(null,{
            title: "新しい正男を投稿",
            page: "game.new",
            data:{}
        });
    });
}

