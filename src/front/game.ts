///<reference path="./data.d.ts" />
import Controller=require('../controllers/index');

import config=require('config');
import logger=require('../logger');

import {outUserData} from '../util';

export default function(c:Controller,r:_Router):void{
    //about game

    /////play
    r.add("/play/:number",(obj,callback:Callback<View>)=>{
        var id=parseInt(obj[":number"]);
        //results
        var game=null, metadata=null, owner=null, series=null;
        var errend=false;
        //結果を収集
        var next=(err)=>{
            if(errend===true){
                return;
            }
            if(err){
                errend=true;
                callback(err,null);
                return;
            }
            if(game!=null && metadata!=null && owner!=null && series!=null){
                //結果が揃った
                if(metadata.hidden===true && obj.session.user!==metadata.owner){
                    //非公開は見れない
                    callback(null,{
                        title: null,
                        page: "game.hidden",
                        data:{
                            id,
                            owner: metadata.owner
                        }
                    });
                }else{
                    callback(null,{
                        title: metadata.title,
                        page: "game.play",
                        data:{
                            game,
                            metadata,
                            owner,
                            series
                        }
                    });
                }
            }
        };
        //ゲームデータを得る
        c.game.getGame(id,true,(err,obj)=>{
            if(err){
                next(err);
                return;
            }
            if(obj==null){
                //そんなゲームはないね
                next("お探しの正男は見つかりませんでした。");
                return;
            }
            game=obj.game;
            metadata=obj.metadata;
            //ownerの情報も得る
            c.user.user.findOneUser({
                id:obj.metadata.owner
            },(err,usr)=>{
                if(err){
                    logger.error(err);
                    next(err);
                    return;
                }
                var data:any=outUserData(usr.getData());
                data.id=usr.id;
                owner=data;
                next(null);
            });
        });
        //シリーズ情報を検索
        c.series.findSeries({games: id},(err,docs)=>{
            if(err){
                next(err);
                return;
            }
            //情報をいい感じに変形
            series=docs.map((s)=>{
                var games=s.games;
                for(var i=0,l=games.length;i<l;i++){
                    if(games[i]===id){
                        //これだ
                        break;
                    }
                }
                return {
                    //シリーズID
                    id: s.id,
                    //シリーズ名
                    name: s.name,
                    //前の正男
                    prev: i>0 ? games[i-1] : null,
                    //次の正男
                    next: i<l-1 ? games[i+1] : null
                };
            });
            next(null);
        });
    });
    /////ついでにシリーズ
    r.add("/series/:number",(obj,callback:Callback<View>)=>{
        var id=parseInt(obj[":number"]);
        //シリーズを探す
        c.series.findSeries({
            id,
            limit: 1
        },(err,docs)=>{
            if(err){
                callback(err,null);
                return;
            }
            var s=docs[0];
            if(s==null){
                //are----
                callback(null,{
                    status: 404,
                    title: null,
                    page: null,
                    data: null
                });
                return;
            }
            var metadatas=null, owner=null;
            var errend=false;
            var next=(err)=>{
                if(errend===true){
                    return;
                }
                if(err){
                    errend=true;
                    callback(err,null);
                    return;
                }
                if(metadatas!=null && owner!=null){
                    //結果そろった
                    callback(null,{
                        title: "シリーズ: "+s.name,
                        page:"series.page",
                        data:{
                            series: s,
                            owner,
                            metadatas
                        }
                    });
                }
            };
            //game一覧
            c.game.findGames({
                ids: s.games
            },(err,games)=>{
                if(err){
                    callback(err,null);
                    return;
                }
                //シリーズ内の順に並び替える
                var table=<any>{};
                for(let i=0;i<games.length;i++){
                    let g=games[i];
                    table[g.id]=g;
                }
                metadatas=s.games.map((id)=>{
                    return table[id];
                });
                next(null);
            });
            //owner情報を得る
            c.user.user.findOneUser({
                id:s.owner
            },(err,usr)=>{
                if(err){
                    logger.error(err);
                    next(err);
                    return;
                }
                var data:any=outUserData(usr.getData());
                data.id=usr.id;
                owner=data;
                next(null);
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
                owner: obj.owner,
                tag: obj.tag
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
    r.add("/game/edit/:number",(obj,callback:Callback<View>)=>{
        callback(null,{
            title: "正男を編集",
            page: "game.edit",
            data:{
                id: parseInt(obj[":number"])
            }
        });
    });
}

