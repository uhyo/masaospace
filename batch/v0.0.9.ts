///<reference path="../src/node.d.ts" />
import mongodb=require('mongodb');

export function run(db:mongodb.Db,callback:()=>void):void{
    console.log("a----");
    callback();
}

