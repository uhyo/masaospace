//ファイルをダウンロードさせる
exports.downloadFile = function(name, blob){
    var a=document.createElement("a");
    a.download=name;
    a.target="_blank";
    a.hidden=true;
    a.style.display="none";
    var u=URL.createObjectURL(blob);
    a.href=u;
    document.body.appendChild(a);

    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(u);
};

//ユーザーにファイルをセレクトさせる
exports.selectFile = function(callback){
    var input=document.createElement("input");
    input.type="file";
    input.hidden=true;
    input.style.display="none";
    input.addEventListener("change",(e)=>{
        var files=input.files;
        if(files[0]!=null){
            callback(files[0]);
        }else{
            callback(null);
        }
    });
    document.body.appendChild(input);
    input.click();

    document.body.removeChild(input);

};
