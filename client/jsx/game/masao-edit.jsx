var React = require('react/addons');
var extend= require('extend');
//masao edit component

var MasaoSelector = require('./masao-selector.jsx'),
    GameMetadataForm = require('./game-metadata-form.jsx'),
    NeedLogin = require('../commons/need-login.jsx'),
    GameView = require('./game-view.jsx'),
    HorizontalMenu = require('../commons/horizontal-menu.jsx'),
    FileList = require('../file/file-list.jsx');

module.exports = React.createClass({
    displayName:"MasaoEdit",
    mixins: [React.addons.LinkedStateMixin],
    propTypes:{
        config: React.PropTypes.object.isRequired,
        session: React.PropTypes.object.isRequired,

        game: React.PropTypes.object,
        metadata: React.PropTypes.object,

        saveButton: React.PropTypes.string.isRequired,
        onSave: React.PropTypes.func.isRequired
    },
    getInitialState(){
        return {
            game:this.props.game || null,
            metadata:this.props.metadata || null,

            filesPage:"filename_pattern",
        };
    },
    masaoSelected(game,metadata){
        if(metadata==null){
            metadata={};
        }
        this.setState({
            game: game,
            metadata: extend({},this.state.metadata,{
                title: metadata.title
            })
        });
    },
    handleMetadata(metadata){
        this.setState({
            metadata: metadata
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
        if(this.props.session.loggedin===false){
            //?????
            return null;
        }
        return <div>
            <div className="warning">
                <p>現在はJava版またはcanvas版の正男が記述されたHTMLファイルの読み込みのみ対応しています。ご了承ください。</p>
                <p>まだ画像はデフォルトのものしか使用できません。</p>
            </div>
            <MasaoSelector onSelect={this.masaoSelected} />
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
        var contents=[{
            id: "filename_pattern",
            name: "パターン画像"
        },{
            id: "filename_title",
            name: "タイトル画像"
        },{
            id: "filename_ending",
            name: "エンディング画像"
        },{
            id: "filename_gameover",
            name: "ゲームオーバー画像"
        },{
            id: "filename_haikei",
            name: "背景画像",
        },{
            id: "filename_mapchip",
            name: "マップチップ（背景レイヤー）"
            //},{
            //id: "-",
            //name: "その他"
        }];
        var query={
            owner: this.props.session.user,
            usage: this.state.filesPage
        };
        return <section className="game-files">
            <h1>ファイル選択</h1>
            <HorizontalMenu contents={contents} pageLink={this.linkState("filesPage")} />
            <FileList config={this.props.config} query={query} fileLink={this.linkState(this.state.filesPage)} />
        </section>;
    },
    form:function(){
        //正男メタデータを入力するフォーム
        var m = this.state.metadata || {};
        return (
            <div>
                <section className="game-metadata-form">
                    <h1>正男情報</h1>
                    <div className="game-new-metadataform-wrapper">
                        <GameMetadataForm onChange={this.handleMetadata} title={m.title} description={m.description} />
                        <form className="form">
                            <p><input className="form-single form-button" type="button" value={this.props.saveButton} disabled={this.isSubmitDisabled()} onClick={this.handleSubmit} /></p>
                        </form>
                    </div>
                </section>
            </div>
        );
    },
    //入力が完了してたら送信できる
    isSubmitDisabled:function(){
        if(this.state.game==null)return true;
        var metadata=this.state.metadata;
        if(metadata==null)return true;

        if(metadata.title && metadata.description)return false;
        return true;
    }
});
