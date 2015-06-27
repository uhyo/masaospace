///<reference path="../node.d.ts" />
///<reference path="./data.d.ts" />

import Controller=require('../controllers/index');
import Router=require('my-router');
//make front views

//parts
import top from './top';
import user from './user';
import game from './game';

export function makeFrontRouter(c:Controller):Router<(obj:any,callback:Callback<View>)=>void>{
    var r=new Router<(obj:any,callback:Callback<View>)=>void>();

    // parts
    top(c,r);
    user(c,r);
    game(c,r);

    return r;
}
