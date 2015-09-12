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
