import Controller from '../controllers/index';

import {
    Router,
} from './data';

export default function(c:Controller,r: Router):void{
    //top view
    r.add("/", ()=>{
        return new Promise((resolve, reject)=>{
            //popular tagsを調べる
            c.game.getPopularTags(10,(err,tags)=>{
                if(err){
                    reject(err);
                    return;
                }
                resolve({
                    title: '',
                    page: {
                        page: 'top',
                        data: {
                            popularTags: tags,
                        },
                    },
                });
            });
        });
    });
}
