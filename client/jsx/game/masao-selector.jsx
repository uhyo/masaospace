//正男データをファイルとかから生成する
var React = require('react');

var FileSelector = require('../commons/file-selector.jsx');

var errorStore=require('../../stores/error');

var masao=require('../../../lib/masao');

module.exports = React.createClass({
    displayName:"MasaoSelector",
    fileSelected:function(file){
        if(file==null){
            this.setGame(null,null);
            return;
        }
        //read file
        var fr=new FileReader();
        if("undefined"===typeof TextDecoder){
            // read as UTF-8
            fr.onload=(e)=>{
                this.fileRead(file.name,fr.result);
            };
            fr.readAsText(file);
            return;
        }
        // Try UTF-8, SJIS, EUC-JP
        fr.readAsArrayBuffer(file);
        fr.onload=(e)=>{
            var ab=fr.result, resultString;
            var td=new TextDecoder("utf-8",{
                fatal: true
            });
            try{
                resultString=td.decode(ab);
            }catch(e){
                //UTF-8ではない
                td=new TextDecoder("shift_jis",{
                    fatal:true
                });
                try{
                    resultString=td.decode(ab);
                }catch(e){
                    td=new TextDecoder("euc-jp",{
                        fatal:true
                    });
                    try{
                        resultString=td.decode(ab);
                    }catch(e){
                        //すべて失敗した
                        errorStore.emit("ファイルを読み込めませんでした。文字コードがUTF-8になっているか確認してください。");
                        this.setGame(null,null);
                        return;
                    }
                }
            }
            this.fileRead(file.name,resultString);
        };
    },
    fileRead:function(name,text){
        //now file is read as text

        //種類を判定
        if(/\.html?$/i.test(name)){
            //HTMLファイルなのでJavaアプレットの正男を探す
            this.readHTMLFile(name,text);
        }else if(/\.json$/i.test(name)){
            //JSONファイルなので中身が正男になっていることを期待
            this.readJSONFile(name,text);
        }else{
            errorStore.emit("対応していない種類のファイルです。");
            this.setGame(null,null);
        }
    },
    readHTMLFile:function(name,text){
        if("undefined"===typeof DOMParser){
            errorStore.emit("ブラウザがHTMLファイルの読み込みに対応していません。");
            this.setGame(null,null);
            return;
        }
        var parser=new DOMParser;
        if("function"!==typeof parser.parseFromString){
            errorStore.emit("ブラウザがHTMLファイルの読み込みに対応していません。");
            this.setGame(null,null);
            return;
        }
        var htmldoc;
        try{
            htmldoc = parser.parseFromString(text,"text/html");
        }catch(e){
            errorStore.emit("HTMLファイルを読み込めませんでした。");
            this.setGame(null,null);
            return;
        }
        if(htmldoc==null){
            errorStore.emit("HTMLファイルを読み込めませんでした。");
            this.setGame(null,null);
            return;
        }
        //HTMLファイルの読み込みに成功。正男を探す
        var applets=htmldoc.querySelectorAll("applet, object");
        var version, params;
        var found=false;
        for(var i=0,l=applets.length;i < l && !found;i++){
            var a=applets[i];

            version=null;
            params={};
            if(a.tagName==="APPLET"){
                //IT IS A OBSOLETE ELEMENT!!!!!!
                if(a.code==="MasaoConstruction"){
                    //ふつうの正男を見つけた
                    var ps=a.getElementsByTagName("param");
                    //paramsを読み込む
                    for(var j=0,m=ps.length;j < m;j++){
                        params[ps[j].name]=ps[j].value;
                    }
                    //正男のバージョン判定
                    if(/\.zip$/.test(a.archive)){
                        version="2.8";
                    }else{
                        version="fx";
                    }
                    found=true;
                    break;
                }
            }else if(a.tagName==="OBJECT"){
                if(/^application\/x-java-applet$/i.test(a.type)){
                    var ps=a.getElementsByTagName("param");
                    for(var j=0,m=ps.length;j < m;j++){
                        var p=ps[j];
                        if(/^classid$/i.test(p.name)){
                            var re=p.value.match(/^java:(.+)$/);
                            if(re){
                                if(re[1]==="MasaoConstruction.class"){
                                    found=true;
                                    continue;
                                }
                            }
                        }else if(/^archive$/i.test(p.name)){
                            if(/\.zip$/.test(p.value)){
                                version="2.8";
                            }else{
                                version="fx";
                            }
                            continue;
                        }
                        params[p.name]=p.value;
                    }
                    break;
                }
            }
        }
        if(found===false){
            //まだ見つからないからcanvas正男をためす
            var scripts=htmldoc.querySelectorAll("script");
            version=null;
            var l=scripts.length;
            for(var i=0;i < l;i++){
                var script=scripts[i];
                if(script.src){
                    if(/v28/.test(script.src)){
                        //canvas正男のバージョンかもしれない
                        version="2.8";
                    }
                    continue;
                }
                var text=scripts[i].text;
                var ps=findCanvasParams(text);
                console.log(ps);
                if(ps!=null){
                    found=true;
                    params=ps;
                }
            }
            if(found===true && version==null){
                //バージョンはfxに認定
                version="fx";
            }
        }
        if(found==false || version==null){
            //正男が見つからなかった
            errorStore.emit("ファイルから正男を検出できませんでした。");
            this.setGame(null);
            return;
        }
        //タイトルを検出する
        var te=htmldoc.querySelector("title");
        var title = te ? te.textContent : "";

        var game={
            id: null,
            version: version,
            params: params,
            resources: []
        };
        this.sanitizeGame(game);
        this.setGame(game,{
            title: title
        });

    },
    readJSONFile:function(name,text){
        var obj;
        try{
            obj=JSON.parse(text);
        }catch(e){
            errorStore.emit("ファイルを読み込めませんでした。JSONフォーマットになっているか確認してください。");
            this.setGame(null);
            return;
        }
        //objがゲームオブジェクトっぽい
        //TODO
        this.setGame({
            id: null,
            version: "fx",
            params: obj,
            resources: []
        },{
            title: ""
        });
    },
    setGame:function(game,metadata){
        if("function"===typeof this.props.onSelect){
            this.props.onSelect(game,metadata);
        }
    },
    sanitizeGame(game){
        if(game==null){
            game={};
        }
        if(game.params==null){
            game.params={};
        }
        masao.removeResources(game.params);
        game.params=masao.removeInvalidParams(game.params);
    },
    render:function(){
        return (
            <div className="game-masao-selector">
                <FileSelector onSelect={this.fileSelected} accept="htm,html,json" />
            </div>
        );
    },
});


function findCanvasParams(text){
    var index=0, len=text.length;
    //ソースからCanvas正男を抽出する
    outerloop: while(index < len){
        var pos=text.indexOf("Game({", index);
        if(pos<0){
            //ないね
            return null;
        }
        var params={};
        //可能性があるところを見つけた
        //パースしていく
        index=pos+6;

        var state=0, key=null, pool="";
        for(;index < len;index++){
            var char=text[index];
            if((state===0 || state===3 || state===4 || state===7) && (char===" " || char==="\t" || char==="\r" || char==="\n")){
                continue;
            }
            if(state===0 && char==='}'){
                //これはいける
                return params;
            }
            if(state===0 || state===4){
                //文字列を探してる
                if(char==="'"){
                    pool="";
                    state+=1;
                }else if(char==='"'){
                    pool="";
                    state+=2;
                }else{
                    //parse error
                    continue outerloop;
                }
            }else if(state===1 || state===5){
                //'の中の文字列
                if(char==="'"){
                    state+=2;
                }else{
                    pool+=char;
                }
            }else if(state===2 || state===6){
                //"の中の文字列
                if(char==='"'){
                    state+=1;
                }else{
                    pool+=char;
                }
            }else if(state===3){
                //:を待っている
                if(char===':'){
                    state=4;
                    key=pool;
                }else{
                    continue outerloop;
                }
            }else if(state===7){
                //終わりかも
                if(char===','){
                    params[key]=pool;
                    state=0;
                }else if(char==='}'){
                    //おわりだ！！！
                    params[key]=pool;
                    return params;
                }else{
                    continue outerloop;
                }
            }
        }
    }
    return null;
}
