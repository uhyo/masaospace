///<reference path="../src/node.d.ts" />
import config=require('config');
import mongodb=require('mongodb');

export function run(db:mongodb.Db,callback:()=>void):void{
    //v0.0.8 -> v0.0.9:
    //GameMetadataにplaycountとtagsを追加
    db.collection(config.get("mongodb.collection.gamemetadata"),(err,coll)=>{
        if(err)throw err;

        coll.updateMany({
            $or: [
                {playcount: {$exists: false}},
                {playcount: null}
            ]
        },{
            $set: {
                playcount: 0
            }
        },(err,result)=>{
            if(err)throw err;
            console.log("add playcount result",result.result);

            coll.updateMany({
                tags: {$exists: false}
            },{
                $set: {
                    tags: []
                }
            },(err,result)=>{
                if(err)throw err;
                console.log("add tags result",result.result);

                callback();
            });
        });
    });
}

