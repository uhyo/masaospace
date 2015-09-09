var React = require('react/addons');
var extend= require('extend');
//masao edit component
var masao = require('../../../lib/masao');

var MasaoSelector = require('./masao-selector.jsx'),
    GameMetadataForm = require('./game-metadata-form.jsx'),
    NeedLogin = require('../commons/need-login.jsx'),
    GameView = require('./game-view.jsx'),
    HorizontalMenu = require('../commons/horizontal-menu.jsx'),
    FileList = require('../file/file-list.jsx');

//とりあえずよく使うやつ
var major=["filename_pattern","filename_title","filename_ending","filename_gameover","filename_haikei","filename_mapchip"];

module.exports = React.createClass({
    displayName:"MasaoEdit",
    mixins: [React.addons.LinkedStateMixin],
    propTypes:{
        config: React.PropTypes.object.isRequired,
        session: React.PropTypes.object.isRequired,

        game: React.PropTypes.object,
        metadata: React.PropTypes.shape({
            title: React.PropTypes.string,
            description: React.PropTypes.string,
            tags: React.PropTypes.arrayOf(React.PropTypes.string),
        }),

        saveButton: React.PropTypes.string.isRequired,
        onSave: React.PropTypes.func.isRequired
    },
    getInitialState(){
        return {
            game:this.props.game || null,
            metadata:this.props.metadata || {
                title: "",
                description: "",
                tags: [],
            },

            filesPage:"filename_pattern",
            filesPage2:null,    //otherのとき
        };
    },
    masaoSelected(game,metadata){
        var metadata_title;
        if(metadata==null){
            metadata_title={};
        }else{
            metadata_title={
                title: metadata.title
            };
        }
        this.setState({
            game: game,
            metadata: extend({},this.state.metadata,metadata_title)
        });
    },
    handleMetadata(metadata){
        this.setState({
            metadata: extend({},this.state.metadata,metadata)
        });
    },
    handleSubmit(e){
        e.preventDefault();
        this.props.onSave({
            game: this.state.game,
            metadata: this.state.metadata
        });

    },
    render(){
        var game=this.state.game;
        return <div>
            <MasaoSelector onSelect={this.masaoSelected} defaultGame={this.state.game}/>
            {game!=null ? this.preview() : null}
            {game!=null ? this.files() : null}
            {game!=null ? this.form() : null}
        </div>;
    },
    preview:function(){
        return <section className="game-masao-preview">
            <h1>正男プレビュー</h1>
            <GameView game={this.state.game} />
        </section>;
    },
    files:function(){
        var contents=major.map((key)=>{
            return {
                id: key,
                name: masao.resources[key]
            };
        }).concat({
            id: "_other",
            name: "その他"
        });
        //どのリソースを変更するか？
        var paramType = this.state.filesPage==="_other" ? this.state.filesPage2 || "filename_chizu": this.state.filesPage;

        var query={
            owner: this.props.session.user,
            usage: masao.resourceToKind[paramType]
        };

        //今どのファイルが選択されているか調べる
        var fileValue=null;
        var resources = this.state.game.resources;
        for(var i=0;i < resources.length;i++){
            if(resources[i].target===paramType){
                fileValue=resources[i].id;
                break;
            }
        }

        //その他の場合のサブメニュー
        var submenu=null;
        if(this.state.filesPage==="_other"){
            submenu=<form className="form">
                <p className="form-row">
                    <select className="form-single" valueLink={this.linkState("filesPage2")}>{
                        Object.keys(masao.resources).map((key)=>{
                            return <option key={key} value={key}>{
                                key+" "+masao.resources[key]
                            }</option>;
                        })
                    }</select>
                </p>
            </form>;
        }

        var fileLink={
            value: fileValue,
            requestChange: this.fileHandler(paramType)
        };
        return <section className="game-files">
            <h1>ファイル選択</h1>
            <HorizontalMenu contents={contents} pageLink={this.linkState("filesPage")} />
            {submenu}
            <FileList config={this.props.config} query={query} useDefault usePreviewLink fileLink={fileLink} />
        </section>;
    },
    form:function(){
        //正男メタデータを入力するフォーム
        var m = this.state.metadata || {};
        var submit=null;
        if(this.props.session.user==null){
            submit=<NeedLogin>
                <p>正男を投稿するにはログインが必要です。</p>
                <p>ページ上部からログインしても作った正男は失われません。</p>
                <p>アカウントをお持ちではありませんか？　<a href="/entry/page" target="_blank">新規登録</a>を行なってください。</p>
            </NeedLogin>;
        }else{
            submit= <form className="form">
                <p><input className="form-single form-button" type="button" value={this.props.saveButton} disabled={this.isSubmitDisabled()} onClick={this.handleSubmit} /></p>
            </form>;
        }
        return (
            <div>
                <section className="game-metadata-form">
                    <h1>正男情報</h1>
                    <div className="game-new-metadataform-wrapper">
                        <GameMetadataForm onChange={this.handleMetadata} title={m.title} description={m.description} tags={m.tags}/>
                        {submit}
                    </div>
                </section>
            </div>
        );
    },
    //入力が完了してたら送信できる
    isSubmitDisabled:function(){
        console.log("disabled?",this.state.game==null, this.state.metadata);
        if(this.state.game==null)return true;
        var metadata=this.state.metadata;
        if(metadata==null)return true;

        if(metadata.title && metadata.description)return false;
        return true;
    },
    //ファイルが替わった
    fileHandler(param){
        return (file)=>{
            //ゲームがかきかわる
            var game=this.state.game;
            var resources = game.resources.concat([]);
            var flag=false;
            if(!file){
                //リソースを削除
                for(var i=0;i < resources.length;i++){
                    if(resources[i].target===param){
                        resources.splice(i,1);
                        i--;
                    }
                }
            }else{
                //リソースを追加
                for(var i=0;i < resources.length;i++){
                    if(resources[i].target===param){
                        //すでにあったので置き換え
                        resources[i] = extend({},resources[i], {
                            id: file.id
                        });
                        flag=true;
                        break;
                    }
                }
                if(flag===false){
                    //なかったので追加する
                    resources.push({
                        target: param,
                        id: file.id
                    });
                }
            }
            //これが新しいゲームだ
            var newGame = extend({},game,{
                resources
            });
            this.setState({
                game: newGame
            });
        };
    }
});
