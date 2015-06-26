var Reflux=require('reflux');
var api=require('./api');

/* page action
 *
 * load(path);
 *
 * load.completed({
 *   title: <string>,
 *   page: page,
 *   path: path,
 *   data: <object>
 * });
 * load.failed(error message);
 */

var load=Reflux.createAction({
    asyncResult:true
});

load.listen(function(path){
    load.promise(api("/api/front",{
        path: path
    })
    .then(function(obj){
        /* obj: {
         *   title: <string>
         *   page: <string>
         *   data: <object>
         * }
         */

        var result={
            title: obj.title,
            path: path,
            page: obj.page,
            data: obj.data
        };
        // add history
        if("undefined"!==typeof history && history.pushState){
            history.pushState(result, null, path);
        }
        return result;
    }));
});

exports.load = load;
