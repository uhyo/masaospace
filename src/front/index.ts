///<reference path="../node.d.ts" />
///<reference path="./data.d.ts" />

import Controller=require('../controllers/index');
import Router=require('my-router');
//make front views

//parts
import top from './top';

export function makeFrontRouter(c:Controller):Router<(callback:Callback<View>)=>void>{
    var r=new Router<(callback:Callback<View>)=>void>();

    // parts
    top(c,r);

    return r;
}
