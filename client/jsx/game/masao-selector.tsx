//正男データをファイルとかから生成する
import * as React from 'react';

import FileSelector from '../file/file-selector';
import HorizontalMenu from '../commons/horizontal-menu';
import GameView from './game-view';
import Loading from '../commons/loading';

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
    MasaoJSONFormat,
} from '../data';

declare var TextDecoder: any;

interface IPropMasaoSelector{
    resources: Array<Resource>;
    onSelect?(game: MasaoJSONFormat): void;
    defaultGame?: MasaoJSONFormat;
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
    onSelect?(game: MasaoJSONFormat | null, metadata?: Partial<GameMetadata>): void;
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
        masao.load.html(text)
        .then(obj=>{
            if (obj == null){
                errorStore.emit("HTMLファイルを読み込めませんでした。");
                this.setGame(null);
                return;
            }
            const metadata = masao.formatToMetadata(obj);
            this.setGame(obj, metadata);
        })
        .catch(errorStore.emit);
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
        let gameobj: MasaoJSONFormat;
        try{
            gameobj = masao.format.load(obj);
        }catch(e){
            errorStore.emit(e);
            this.setGame(null);
            return;
        }
        const metadata = masao.formatToMetadata(gameobj);
        
        this.setGame(gameobj, metadata);
    }
    protected setGame(game: MasaoJSONFormat | null, metadata?: Partial<GameMetadata>){
        if("function"===typeof this.props.onSelect){
            this.props.onSelect(game, metadata);
        }
    }
    render(){
        return <div className="game-masao-selector">
            <FileSelector onSelect={this.fileSelected.bind(this)} accept="htm,html,json" />
        </div>;
    }
}

export interface IPropFromEditor{
    resources: Array<Resource>;
    onSelect?(game: MasaoJSONFormat, metadata?: Partial<GameMetadata>): void;
    defaultGame?: MasaoJSONFormat;
}
export interface IStateFromEditor{
    editorComponent: typeof MasaoEditorCore | undefined;

    testplay: boolean;
    testgame: Game | null;
}
class FromEditor extends React.Component<IPropFromEditor, IStateFromEditor>{
    constructor(props: IPropFromEditor){
        super(props);
        this.state = {
            editorComponent: void 0,
            testplay: false,
            testgame: null,
        };
    }
    componentDidMount(){
        // FIXME
        // TypeScriptがdynamic importを実装したら見直す
        require.ensure(['masao-editor-core'], (require)=>{
            const editorComponent = require<any>('masao-editor-core').default as typeof MasaoEditorCore;
            this.setState({
                editorComponent,
            });
        }, (error)=>{
            errorStore.emit(error);
        });
    }

    render(){
        const {
            editorComponent,
            testplay,
            testgame,
        } = this.state;

        if (editorComponent == null){
            return <Loading/>;
        }

        let testplayArea = null;
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
        let defaultGame = this.props.defaultGame;
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

        const editor = React.createElement(editorComponent, {
            // jsWarning: true,
            filename_pattern,
            filename_mapchip,
            defaultGame,
            externalCommands: externals,
        });

        // FIXME
        return <div>
            {testplayArea}
            {editor}
        </div>;
    }
    protected handleSave(obj: MasaoJSONFormat){
        if("function"===typeof this.props.onSelect){
            this.props.onSelect(obj);
        }
    }
    protected handleFileSave(obj: MasaoJSONFormat){
        //あの、ファイルに保存したいのですが……
        const fileData = JSON.stringify(obj);
        const blob=new Blob([fileData], {type: "application/json"});
        file.downloadFile("masao.json", blob);
    }
    protected handleTestplay(obj: MasaoJSONFormat){
        const testgame = masao.formatToGame(obj, this.props.resources);
        this.setState({
            testplay: true,
            testgame,
        });
    }
}
