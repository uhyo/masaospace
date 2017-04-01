///<reference path="./data.d.ts" />
import Controller from '../controllers/index';

export default function(c:Controller,r:_Router):void{
    //top view
    r.add("/",(_,callback:Callback<View>)=>{
        //popular tagsを調べる
        c.game.getPopularTags(10,(err,tags)=>{
            if(err){
                callback(err,null);
                return;
            }
            callback(null,{
                title:"",
                page:"top",
                data:{
                    popularTags: tags
                }
            });
        });
    });
}
