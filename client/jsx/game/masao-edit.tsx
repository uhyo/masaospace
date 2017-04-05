import * as React from 'react';
//masao edit component
import {
    masao,
} from '@uhyo/masaospace-util';

import MasaoSelector from './masao-selector';
import GameMetadataForm from './game-metadata-form';
import NeedLogin from '../commons/need-login';
import GameView from './game-view';
import HorizontalMenu from '../commons/horizontal-menu';
import FileList from '../file/file-list';

import {
    File,
    Session,
    Game,
    GameEditableMetadata,
    Resource,
} from '../data';
//とりあえずよく使うやつ
const major = ["filename_pattern","filename_title","filename_ending","filename_gameover","filename_haikei","filename_mapchip"];

interface IPropMasaoEdit{
    config: any;
    session: Session;
    game?: Game;
    metadata?: GameEditableMetadata;
    saveButton: string;
    onSave(obj: {
        game: Game;
        metadata: GameEditableMetadata;
    }): void;
}
interface IStateMasaoEdit{
    game: Game | undefined;
    metadata: GameEditableMetadata;
    resources: Array<Resource>;

    filesPage: string;
    filesPage2: string | null;
}
export default class MasaoEdit extends React.Component<IPropMasaoEdit, IStateMasaoEdit>{
    constructor(props: IPropMasaoEdit){
        super(props);
        this.state = {
            game:this.props.game || void 0,
            metadata:this.props.metadata || {
                title: "",
                description: "",
                tags: [],
                hidden: false
            },

            resources: this.props.game ? this.props.game.resources : [],

            filesPage:"filename_pattern",
            filesPage2:null,    //otherのとき
        };
    }
    protected masaoSelected(game: Game, metadata: GameEditableMetadata){
        const {
            resources,
            metadata: m,
        } = this.state;

        let metadata_title;
        if(metadata == null){
            metadata_title = {};
        }else{
            metadata_title = {
                title: metadata.title
            };
        }
        //resourcesをひきつぐ
        if(game!=null){
            game.resources = resources;
        }
        this.setState({
            game: game,
            metadata: {
                ...m,
                metadata_title,
            },
        });
    }
    protected handleMetadata(metadata: GameEditableMetadata){
        this.setState({
            metadata: {
                ... this.state.metadata,
                metadata,
            },
        });
    }
    protected handleSubmit(e: React.SyntheticEvent<HTMLElement>){
        e.preventDefault();
        this.props.onSave({
            game: this.state.game!,
            metadata: this.state.metadata,
        });
    }
    render(){
        const {
            game,
            resources,
        } = this.state;
        return <div>
            <MasaoSelector resources={resources} onSelect={this.masaoSelected.bind(this)} defaultGame={game}/>
            {this.files()}
            {game!=null ? this.preview() : null}
            {game!=null ? this.form() : null}
        </div>;
    }
    protected preview(){
        return <section className="game-masao-preview">
            <h1>正男プレビュー</h1>
            <GameView allowScripts game={this.state.game!} />
        </section>;
    }
    files(){
        const {
            props: {
                config,
                session,
            },
            state: {
                filesPage,
                filesPage2,
                resources,
            },
        } = this;
        const contents = major.map((key)=>{
            return {
                id: key,
                name: masao.resources[key],
            };
        }).concat({
            id: "_other",
            name: "その他",
        });
        //どのリソースを変更するか？
        const paramType = filesPage==="_other" ? filesPage2 || "filename_chizu": filesPage;

        const query = {
            owner: session.user,
            usage: masao.resourceToKind[paramType],
        };

        //今どのファイルが選択されているか調べる
        let fileValue: string | undefined = void 0;
        for(let i=0; i < resources.length; i++){
            if(resources[i].target === paramType){
                fileValue = resources[i].id;
                break;
            }
        }

        //その他の場合のサブメニュー
        let submenu=null;
        if(filesPage==="_other"){
            const handleChange = (e: React.SyntheticEvent<HTMLSelectElement>)=>{
                this.setState({
                    filesPage2: e.currentTarget.value,
                });
            };
            submenu=<form className="form">
                <p className="form-row">
                    <select className="form-single" onChange={handleChange}>{
                        Object.keys(masao.resources).map((key)=>{
                            const c = filesPage2 === key;
                            return <option key={key} value={key} selected={c}>{
                                `${key} ${masao.resources[key]}`
                            }</option>;
                        })
                    }</select>
                </p>
            </form>;
        }

        const handlePageChange = (page: string)=>{
            this.setState({
                filesPage: page,
            });
        };
        return <section className="game-files">
            <h1>ファイル選択</h1>
            <HorizontalMenu contents={contents} page={filesPage} onChange={handlePageChange} />
            {submenu}
            <FileList config={config} query={query} useDefault usePreviewLink currentFile={fileValue} onChange={this.fileHandler(paramType)} />
        </section>;
    }
    protected form(){
        const {
            props: {
                session,
                saveButton,
            },
            state: {
                metadata,
            },
        } = this;
        //正男メタデータを入力するフォーム
        const m: Partial<GameEditableMetadata> = metadata || {};
        let submit = null;
        if(session.user==null){
            submit = <NeedLogin>
                <p>正男を投稿するにはログインが必要です。</p>
                <p>ページ上部からログインしても作った正男は失われません。</p>
                <p>アカウントをお持ちではありませんか？　<a href="/entry/page" target="_blank">新規登録</a>を行ってください。</p>
            </NeedLogin>;
        }else{
            submit = <form className="form">
                <p><input className="form-single form-button" type="button" value={saveButton} disabled={this.isSubmitDisabled()} onClick={this.handleSubmit.bind(this)} /></p>
            </form>;
        }
        return <div>
            <section className="game-metadata-form">
                <h1>正男情報</h1>
                <div className="game-new-metadataform-wrapper">
                    <GameMetadataForm onChange={this.handleMetadata.bind(this)} title={m.title || ''} description={m.description || ''} tags={m.tags || []} hidden={!!m.hidden}/>
                    {submit}
                </div>
            </section>
        </div>;
    }
    //入力が完了してたら送信できる
    isSubmitDisabled(){
        const {
            game,
            metadata,
        } = this.state;
        if(game == null || metadata == null){
            return true;
        }

        if(metadata.title && metadata.description){
            return false;
        }
        return true;
    }
    //ファイルが替わった
    protected fileHandler(param: string){
        return (file: File | null)=>{
            //ゲームがかきかわる
            const {
                game,
            } = this.state;
            const resources = [
                ... this.state.resources,
            ];
            let flag = false;
            if(!file){
                //リソースを削除
                for(let i=0; i < resources.length; i++){
                    if(resources[i].target === param){
                        resources.splice(i,1);
                        i--;
                    }
                }
            }else{
                //リソースを追加
                for(let i=0; i < resources.length; i++){
                    if(resources[i].target === param){
                        //すでにあったので置き換え
                        resources[i] = {
                            ... resources[i],
                            id: file.id,
                        };
                        flag = true;
                        break;
                    }
                }
                if(flag === false){
                    //なかったので追加する
                    resources.push({
                        target: param,
                        id: file.id,
                    });
                }
            }
            //これが新しいゲームだ
            const newGame = game==null ? void 0 : {
                ...game,
                resources,
            };
            this.setState({
                game: newGame,
                resources,
            });
        };
    }
}
