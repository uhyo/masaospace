//正男データをファイルとかから生成する
import * as React from 'react';

import FileSelector from '../file/file-selector';
import HorizontalMenu from '../commons/horizontal-menu';
import GameView from './game-view';

import MasaoEditorCore from 'masao-editor-core';

import errorStore from '../../stores/error';

import {
    masao,
} from '@uhyo/masaospace-util';
import * as file from '../../scripts/file';

import {
    Resource,
    Game,
    GameMetadata,
    MasaoCategory,
} from '../data';

declare var TextDecoder: any;

interface IPropMasaoSelector{
    resources: Array<Resource>;
    onSelect?(game: Game): void;
    defaultGame?: Game;
}
interface IStateMasaoSelector{
    mode: 'file' | 'editor';
}
export default class MasaoSelector extends React.Component<IPropMasaoSelector, IStateMasaoSelector>{
    constructor(props: IPropMasaoSelector){
        super(props);
        this.state = {
            mode: 'editor',
        };
    }
    render(){
        const {
            props: {
                resources,
                onSelect,
                defaultGame,
            },
            state: {
                mode,
            },
        } = this;
        const menu = [{
            id: "file",
            name: "ファイルを読み込み"
        },{
            id: "editor",
            name: "正男エディタで作成"
        }];
        let main = null;
        if(mode === "file"){
            main = <FromFile onSelect={onSelect} />;
        }else if(mode==="editor"){
            //TODO
            main = <FromEditor resources={resources} onSelect={onSelect} defaultGame={defaultGame}/>;
        }
        const pageChange = (mode: 'file' | 'editor')=>{
            this.setState({
                mode,
            });
        };
        return <div>
            <HorizontalMenu contents={menu} page={mode} onChange={pageChange}/>
            {main}
        </div>;
    }
}

interface IPropFromFile{
    onSelect?(game: Game | null, metadata?: Partial<GameMetadata>): void;
}
class FromFile extends React.Component<IPropFromFile, {}>{
    protected fileSelected(file: File | null){
        if(file==null){
            this.setGame(null);
            return;
        }
        //read file
        const fr = new FileReader();
        if("undefined"===typeof TextDecoder){
            // read as UTF-8
            fr.onload=()=>{
                this.fileRead(file.name, fr.result);
            };
            fr.readAsText(file);
            return;
        }
        // Try UTF-8, SJIS, EUC-JP
        fr.readAsArrayBuffer(file);
        fr.onload=()=>{
            const ab=fr.result;
            let resultString;
            const td = new TextDecoder("utf-8", {
                fatal: true,
            });
            try{
                resultString = td.decode(ab);
            }catch(e){
                //UTF-8ではない
                const td = new TextDecoder("shift_jis", {
                    fatal:true,
                });
                try{
                    resultString = td.decode(ab);
                }catch(e){
                    const td = new TextDecoder("euc-jp", {
                        fatal:true,
                    });
                    try{
                        resultString=td.decode(ab);
                    }catch(e){
                        //すべて失敗した
                        errorStore.emit(new Error("ファイルを読み込めませんでした。文字コードがUTF-8になっているか確認してください。"));
                        this.setGame(null);
                        return;
                    }
                }
            }
            this.fileRead(file.name, resultString);
        };
    }
    protected fileRead(name: string,text: string){
        //now file is read as text

        //種類を判定
        if(/\.html?$/i.test(name)){
            //HTMLファイルなのでJavaアプレットの正男を探す
            this.readHTMLFile(name, text);
        }else if(/\.json$/i.test(name)){
            //JSONファイルなので中身が正男になっていることを期待
            this.readJSONFile(name, text);
        }else{
            errorStore.emit("対応していない種類のファイルです。");
            this.setGame(null);
        }
    }
    protected readHTMLFile(_name: string, text: string){
        if("undefined"===typeof DOMParser){
            errorStore.emit("ブラウザがHTMLファイルの読み込みに対応していません。");
            this.setGame(null);
            return;
        }
        const parser = new DOMParser;
        if("function"!==typeof parser.parseFromString){
            errorStore.emit("ブラウザがHTMLファイルの読み込みに対応していません。");
            this.setGame(null);
            return;
        }
        let htmldoc;
        try{
            htmldoc = parser.parseFromString(text, "text/html");
        }catch(e){
            errorStore.emit("HTMLファイルを読み込めませんでした。");
            this.setGame(null);
            return;
        }
        if(htmldoc==null){
            errorStore.emit("HTMLファイルを読み込めませんでした。");
            this.setGame(null);
            return;
        }
        //HTMLファイルの読み込みに成功。正男を探す
        const applets = htmldoc.querySelectorAll<'applet' | 'object'>("applet, object" as any);
        let version: MasaoCategory | null = null;
        let params: Record<string, string> | null= null;
        let found=false;
        for(let i=0, l=applets.length; i < l && !found; i++){
            const a = applets[i];

            version = null;
            params = {};
            if(a.tagName==="APPLET"){
                //IT IS A OBSOLETE ELEMENT!!!!!!
                if(a.getAttribute('code') === "MasaoConstruction"){
                    //ふつうの正男を見つけた
                    const ps = a.getElementsByTagName<"param">("param");
                    //paramsを読み込む
                    for(let j=0,m=ps.length; j < m; j++){
                        params[ps[j].name] = ps[j].value;
                    }
                    //正男のバージョン判定
                    if(/\.zip$/.test(a.getAttribute('archive') || '')){
                        version="2.8";
                    }else{
                        version="fx";
                    }
                    found=true;
                    break;
                }
            }else if(a.tagName==="OBJECT"){
                if(/^application\/x-java-applet$/i.test(a.type)){
                    const ps = a.getElementsByTagName("param");
                    for(let j=0,m=ps.length; j < m; j++){
                        const p = ps[j];
                        if(/^classid$/i.test(p.name)){
                            const re=p.value.match(/^java:(.+)$/);
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
            const scripts = htmldoc.querySelectorAll("script");
            version = null;
            const l = scripts.length;
            for(let i=0; i < l; i++){
                const script=scripts[i];
                if(script.src){
                    if(/v28/.test(script.src)){
                        //canvas正男のバージョンかもしれない
                        version="2.8";
                    }
                    continue;
                }
                const text=scripts[i].text;
                const ps = findCanvasParams(text);
                console.log(ps);
                if(ps!=null){
                    found = true;
                    params = ps;
                }
            }
            if(found===true && version==null){
                //バージョンはfxに認定
                version="fx";
            }
        }
        if(found==false || version==null || params==null){
            //正男が見つからなかった
            errorStore.emit(new Error("ファイルから正男を検出できませんでした。"));
            this.setGame(null);
            return;
        }
        //タイトルを検出する
        const te=htmldoc.querySelector("title");
        const title = te ? te.textContent || '' : "";

        const game: Game = {
            id: null,
            version,
            params,
            resources: [],
            script: null,
        };
        this.sanitizeGame(game);
        this.setGame(game, {
            title,
        });
    }
    protected readJSONFile(_name: string, text: string){
        let obj;
        try{
            obj = JSON.parse(text);
        }catch(e){
            errorStore.emit(new Error("ファイルを読み込めませんでした。JSONフォーマットになっているか確認してください。"));
            this.setGame(null);
            return;
        }
        if(obj == null){
            errorStore.emit(new Error("ファイルを読み込めませんでした。JSONフォーマットになっているか確認してください。"));
            this.setGame(null);
            return;
        }
        let gameobj;
        try{
            gameobj = masao.format.load(obj);
        }catch(e){
            errorStore.emit(e);
            this.setGame(null);
            return;
        }
        let params=gameobj.params, metadata=gameobj.metadata, title="";
        if(metadata!=null){
            if("string"===typeof metadata.title){
                title=metadata.title;
            }
        }
        
        this.setGame({
            id: null,
            version: masao.versionCategory(gameobj.version),
            params,
            resources: [],
            script: null,
        },{
            title,
        });
    }
    protected setGame(game: Game | null, metadata?: Partial<GameMetadata>){
        if("function"===typeof this.props.onSelect){
            this.props.onSelect(game, metadata);
        }
    }
    protected sanitizeGame(game: Partial<Game> | null){
        if(game==null){
            game={};
        }
        if(game.params==null){
            game.params = {};
        }
        masao.removeResources(game.params);
        game.params=masao.removeInvalidParams(game.params);
    }
    render(){
        return <div className="game-masao-selector">
            <FileSelector onSelect={this.fileSelected} accept="htm,html,json" />
        </div>;
    }
}

function findCanvasParams(text: string): Record<string, string> | null{
    let index=0;
    const len=text.length;
    //ソースからCanvas正男を抽出する
    outerloop: while(index < len){
        const pos=text.indexOf("Game({", index);
        if(pos<0){
            //ないね
            return null;
        }
        const params: Record<string, string> = {};
        //可能性があるところを見つけた
        //パースしていく
        index = pos+6;

        let state=0, key='', pool="";
        for(;index < len;index++){
            const char=text[index];
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

export interface IPropFromEditor{
    resources: Array<Resource>;
    onSelect?(game: Game, metadata?: Partial<GameMetadata>): void;
    defaultGame?: Game;
}
export interface IStateFromEditor{
    testplay: boolean;
    testgame: Game | null;
}
class FromEditor extends React.Component<IPropFromEditor, IStateFromEditor>{
    constructor(props: IPropFromEditor){
        super(props);
        this.state = {
            testplay: false,
            testgame: null,
        };
    }
    render(){
        let testplayArea = null;
        const {
            testplay,
            testgame,
        } = this.state;
        if(testplay===true && testgame != null){
            const handleClose = ()=>{
                this.setState({
                    testplay: false,
                    testgame: null,
                });
            };
            testplayArea = <section className="game-masao-preview">
                <h1>テストプレイ</h1>
                <p><span className="clickable" onClick={handleClose}>テストプレイを終了</span></p>
                <GameView allowScripts game={testgame}/>
            </section>;
        }else{
            testplayArea = <section className="game-masao-preview-closed"/>;
        }
        let defaultGame = null;
        if(this.props.defaultGame){
            //masao.spaceの形式をmasao-json-formatにする
            defaultGame = masao.format.make({
                version: masao.categoryToVersion(this.props.defaultGame.version),
                params: this.props.defaultGame.params,
                script: this.props.defaultGame.script || void 0,
            });
        }
        //ファイル名をアレする
        let filename_pattern="/static/pattern.gif", filename_mapchip="/static/mapchip.gif";
        for(let i=0, resources=this.props.resources, l=resources.length; i < l; i++){
            const o = resources[i];
            if(o.target==="filename_pattern"){
                filename_pattern = `/uploaded/${o.id}`;
            }else if(o.target==="filename_mapchip"){
                filename_mapchip = `/uploaded${o.id}`;
            }
        }
        const externals = [
            {
                label: "保存（投稿画面へ）",
                request: this.handleSave.bind(this),
            },
            {
                label: "ファイルに保存",
                request: this.handleFileSave.bind(this),
            },
            {
                label: "テストプレイ",
                request: this.handleTestplay.bind(this),
            }
        ];

        // FIXME
        return <div>
            {testplayArea}
            <MasaoEditorCore /* jsWarning */ filename_pattern={filename_pattern} filename_mapchip={filename_mapchip} defaultGame={defaultGame} externalCommands={externals}/>
        </div>;
    }
    protected handleSave(obj: Game){
        //gameは適当につくる
        const game={
            id: null,
            version: masao.versionCategory(obj.version),
            params: obj.params,
            resources: [],
            script: obj.script
        };

        if("function"===typeof this.props.onSelect){
            this.props.onSelect(game);
        }
    }
    protected handleFileSave(obj: Game){
        //あの、ファイルに保存したいのですが……
        const fileData = JSON.stringify(obj);
        const blob=new Blob([fileData], {type: "application/json"});
        file.downloadFile("masao.json", blob);
    }
    protected handleTestplay(obj: Game){
        this.setState({
            testplay: true,
            testgame: {
                id: null,
                version: masao.versionCategory(obj.version),
                params: obj.params,
                resources: this.props.resources,
                script: obj.script,
            }
        });
    }
}
