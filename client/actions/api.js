//Server-side API call
//
module.exports = api;

//returns Promise!
//path: APIのパス
//params: APIに渡すquery
//contentType: multipart/form-dataとか
//raw: JSONでパースせずにArrayBufferで受け取る
function api(path,params,contentType,raw){
    var Promise = require('native-promise-only');
    if(params == null){
        params = {};
    }
    var xhr=new XMLHttpRequest();
    xhr.open("POST",path);
    if(raw){
        //???
        xhr.responseType="arraybuffer";
    }
    var requestBody;
    if(contentType==="multipart/form-data"){
        //FormDataを使ってあれする
        requestBody=new FormData;
        xhr.setRequestHeader("X-CSRF-Token",_g_csrfToken);
        for(var key in params){
            if(params[key]!=null){
                requestBody.append(key,params[key]);
            }
        }
    }else{
        var ps=[];
        ps.push("_csrf="+encodeURIComponent(_g_csrfToken));
        for(var key in params){
            if(params[key]!=null){
                ps.push(encodeURIComponent(key)+"="+encodeURIComponent(params[key]));
            }
        }
        requestBody=ps.join("&");
        xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
    }
    xhr.send(requestBody);

    console.log("API call! ",path,params,requestBody);

    var p=new Promise(function(resolve,reject){
        xhr.addEventListener("load",function(e){
            if(xhr.status!==200){
                console.error(xhr.status,xhr.responseText);
                reject(xhr.responseText);
                return;
            }
            if(raw){
                //そのままうけとる
                resolve(xhr.response);
                return;
            }
            var obj;
            try{
                obj=JSON.parse(xhr.response);
            }catch(e){
                console.error(xhr.response);
                reject(String(e));
                return;
            }
            if(obj.error!=null){
                console.error(obj.error);
                reject(String(obj.error));
                return;
            }
            console.log(obj);
            resolve(obj);
        });
    });
    return p;
}
