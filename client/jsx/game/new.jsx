var React = require('react');

var MasaoSelector = require('./masao-selector.jsx');
var GameMetadataForm = require('./game-metadata-form.jsx');
var ErrorMessage = require('../commons/error.jsx');

var api=require('../../actions/api');
var pageActions=require('../../actions/page');

module.exports = React.createClass({
    displayName:"New",
    getInitialState:function(){
        return {
            error:null,
            game:null,
            metadata:null
        };
    },
    masaoSelected:function(game,metadata){
        if(metadata==null){
            metadata={};
        }
        this.setState({
            game:game,
            metadata: {
                title: metadata.title,
            }
        });
    },
    handleMetadata:function(metadata){
        this.setState({
            metadata: metadata
        });
    },
    handleSubmit:function(){
        //正男を投稿
        var _this=this;
        api("/api/game/new",{
            game: JSON.stringify(this.state.game),
            metadata: JSON.stringify(this.state.metadata)
        }).then(function(result){
            //投稿結果ページに移動
            pageActions.load("/play/"+result.id);
        }).catch(function(e){
            _this.setState({
                error: String(e)
            });
        });

    },
    render:function(){
        return (
            //TODO
            <section>
                <h1>新しい正男を投稿</h1>
                <div className="warning">
                    <p>現在はJava版の正男が記述されたHTMLファイルの読み込みのみ対応しています。ご了承ください。</p>
                </div>
                <ErrorMessage>{this.state.error}</ErrorMessage>
                <MasaoSelector onSelect={this.masaoSelected} />
                {this.state.game!=null ? this.form() : null}
            </section>
        );
    },
    form:function(){
        //正男メタデータを入力するフォーム
        var m = this.state.metadata || {};
        return (
            <div>
                <GameMetadataForm onChange={this.handleMetadata} title={m.title} />
                <form className="form">
                    <p><input className="form-single form-button" type="button" value="投稿する" disabled={this.isSubmitDisabled()} onClick={this.handleSubmit} /></p>
                </form>
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
