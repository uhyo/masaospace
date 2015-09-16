///<reference path="../src/node.d.ts" />
import config=require('config');
import mongodb=require('mongodb');

export function run(db:mongodb.Db,callback:()=>void):void{
    //v0.0.13 -> v0.0.14:
    //GameMetadataにhiddenを追加
    db.collection(config.get("mongodb.collection.gamemetadata"),(err,coll)=>{
        if(err)throw err;

        coll.updateMany({
            $or: [
                {hidden: {$exists: false}},
                {hidden: null}
            ]
        },{
            $set: {
                hidden: false
            }
        },(err,result)=>{
            if(err)throw err;
            console.log("add hidden result",result.result);

            callback();
        });
    });
}


