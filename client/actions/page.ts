import {
    createAsyncAction,
} from '../scripts/reflux-util';
import api from './api';

import {
    PageData,
} from '../jsx/data';

/* page action
 */
export const load = createAsyncAction<string, {
    title: string;
    path: string;
    page: PageData;
}>();

load.listen((path: string)=>{
    load.promise(api("/api/front",{
        path,
    })
    .then((obj: {
        title: string;
        path: string;
        page: PageData;
    })=>{
        const result = {
            title: obj.title,
            path,
            page: obj.page,
        };
        // add history
        if("undefined"!==typeof history && history.pushState){
            history.pushState(result, '', path);
        }
        return result;
    }));
});
