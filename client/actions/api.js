//Server-side API call

module.exports = api;

//returns Promise!
function api(path,params){
    var Promise = Promise ? Promise : require('native-promise-only');
    if(params == null){
        params = {};
    }
    var d=new FormData();
    for(var key in params){
        d.append(key,params[key]);
    }
    var xhr=new XMLHttpRequest();
    xhr.open("POST",path);
    xhr.send(d);

    console.log("API call! ",path,params);

    var p=new Promise(function(resolve,reject){
        xhr.addEventListener("load",function(e){
            if(e.statusCode!==200){
                reject(xhr.responseText);
                return;
            }
            var obj;
            try{
                obj=JSON.parse(e.response);
            }catch(e){
                reject(String(e));
                return;
            }
            if(obj.error!=null){
                reject(String(obj.error));
                return;
            }
            resolve(obj);
        });
    });
    return p;
}
