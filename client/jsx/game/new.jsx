var React = require('react');

var MasaoSelector = require('./masao-selector.jsx');
var GameMetadataForm = require('./game-metadata-form.jsx');

var api=require('../../actions/api');

module.exports = React.createClass({
    displayName:"New",
    getInitialState:function(){
        return {
            error:null,
            game:null,
            metadata:null
        };
    },
    masaoSelected:function(game){
        this.setState({
            game:game,
        });
    },
    handleMetadata:function(metadata){
        console.log(metadata);
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
            //TODO
            console.log(result);
        }).catch(function(e){
            console.log("eeeeee",e);
            _this.setState({
                error: String(e)
            });
        });

    },
    render:function(){
        return (
            <section>
                <h1>新しい正男を投稿</h1>
                <MasaoSelector onSelect={this.masaoSelected} />
                {this.state.game!=null ? this.form() : null}
            </section>
        );
    },
    form:function(){
        //正男メタデータを入力するフォーム
        return (
            <div>
                <GameMetadataForm onChange={this.handleMetadata} />
                <p><input type="button" value="投稿する" disabled={this.isSubmitDisabled()} onClick={this.handleSubmit} /></p>
            </div>
        );
    },
    //入力が完了してたら送信できる
    isSubmitDisabled:function(){
        if(this.state.game==null)return true;
        var metadata=this.state.metadata;
        if(metadata==null)return true;

        if(metadata.title && metadata.description && metadata.level)return false;
        return true;
    }
});
