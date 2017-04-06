///<reference path="../node.d.ts" />

import Controller from '../controllers/index';
import {
    Router,
} from 'my-router';
import {
    PageData,
    RouteHandler,
} from '@uhyo/masaospace-util';

//make front views

//parts
import top from './top';
import user from './user';
import game from './game';

export interface RouteObject{
    title: string;
    page: PageData;
}

export function makeFrontRouter(c:Controller):Router<RouteHandler>{
    var r=new Router<RouteHandler>({
        patterns:{
            ":number": /^\d+$/,
        }
    });

    // parts
    top(c,r);
    user(c,r);
    game(c,r);

    return r;
}
