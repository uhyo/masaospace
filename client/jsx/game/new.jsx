var React = require('react'),
    Reflux=require('reflux');

var MasaoSelector = require('./masao-selector.jsx');
var GameMetadataForm = require('./game-metadata-form.jsx');
var NeedLogin = require('../commons/need-login.jsx');

var api=require('../../actions/api');
var pageActions=require('../../actions/page');
var errorStore=require('../../stores/error');

module.exports = React.createClass({
    displayName:"New",
    propTypes:{
        config: React.PropTypes.object.isRequired,
        session: React.PropTypes.object.session
    },
    getInitialState:function(){
        return {
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
            errorStore.emit(String(e));
        });

    },
    render:function(){
        if(this.props.session.loggedin===false){
            return <section>
                <h1>新しい正男を投稿</h1>
                <NeedLogin/>
            </section>;
        }
        return (
            //TODO
            <section>
                <h1>新しい正男を投稿</h1>
                <div className="warning">
                    <p>現在はJava版またはcanvas版の正男が記述されたHTMLファイルの読み込みのみ対応しています。ご了承ください。</p>
                    <p>まだ画像はデフォルトのものしか使用できません。</p>
                </div>
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
