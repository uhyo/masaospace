import {
    createAsyncAction,
} from '../scripts/reflux-util';
var api=require('./api');

/* page action
 */
export const load = createAsyncAction<string, {
    title: string;
    page: any;
    path: string;
    data: any;
}>();

load.listen((path: string)=>{
    load.promise(api("/api/front",{
        path,
    })
    .then((obj: {
        title: string;
        page: string;
        data: any;
    })=>{
        const result = {
            title: obj.title,
            path: path,
            page: obj.page,
            data: obj.data
        };
        // add history
        if("undefined"!==typeof history && history.pushState){
            history.pushState(result, '', path);
        }
        return result;
    }));
});
