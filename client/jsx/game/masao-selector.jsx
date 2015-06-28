//正男データをファイルとかから生成する
var React = require('react');

var FileSelector = require('../commons/file-selector.jsx');

var GameView = require('./game-view.jsx');

module.exports = React.createClass({
    displayName:"MasaoSelector",
    getInitialState:function(){
        return {
            error: null,
            game: null
        };
    },
    fileSelected:function(file){
        if(file==null){
            this.setState({
                game:null
            });
            return;
        }
        //read file
        var fr=new FileReader();
        var _this=this;
        if("undefined"===typeof TextDecoder){
            // read as UTF-8
            fr.onload=function(e){
                _this.fileRead(fr.result);
            };
            fr.readAsText(file);
            return;
        }
        // Try UTF-8, SJIS, EUC-JP
        fr.readAsArrayBuffer(file);
        fr.onload=function(e){
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
                        _this.setState({
                            error: "ファイルを読み込めませんでした。文字コードがUTF-8になっているか確認してください。"
                        });
                        return;
                    }
                }
            }
            _this.fileRead(resultString);
        };
    },
    fileRead:function(text){
        //now file is read as text
        if("undefined"===typeof DOMParser){
            this.setState({
                error: "ブラウザがHTMLファイルの読み込みに対応していません。"
            });
            return;
        }
        var parser=new DOMParser;
        if("function"!==typeof parser.parseFromString){
            this.setState({
                error: "ブラウザがHTMLファイルの読み込みに対応していません。"
            });
            return;
        }
        var htmldoc;
        try{
            htmldoc = parser.parseFromString(text,"text/html");
        }catch(e){
            this.setState({
                error: "HTMLファイルを読み込めませんでした。"
            });
            return;
        }
        if(htmldoc==null){
            this.setState({
                error: "HTMLファイルを読み込めませんでした。"
            });
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
                }
            }
        }
        if(found==false || version==null){
            //正男が見つからなかった
            this.setState({
                error: "ファイルから正男を検出できませんでした。"
            });
            return;
        }
        this.setState({
            game: {
                id: null,
                version: version,
                params: params,
                resources: []
            }
        });

    },
    render:function(){
        return (
            <section>
                <h1>正男プレビュー</h1>
                <FileSelector onSelect={this.fileSelected} accept="*.htm; *.html" />
                { this.state.game ? <GameView game={this.state.game} /> : null}
            </section>
        );
    }
});

