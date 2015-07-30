var React = require('react');

var NeedLogin = require('../commons/need-login.jsx'),
    GameEdit = require('./masao-edit.jsx');


var api=require('../../actions/api');
var pageActions=require('../../actions/page');
var errorStore=require('../../stores/error');

module.exports = React.createClass({
    displayName:"New",
    propTypes:{
        config: React.PropTypes.object.isRequired,
        session: React.PropTypes.object.isRequired
    },
    handleSave:function({game,metadata}){
        //正男を投稿
        api("/api/game/new",{
            game: JSON.stringify(game),
            metadata: JSON.stringify(metadata)
        }).then(function(result){
            //投稿結果ページに移動
            pageActions.load("/play/"+result.id);
        }).catch(errorStore.emit);
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
                <GameEdit config={this.props.config} session={this.props.session} saveButton="投稿する" onSave={this.handleSave} />
            </section>
        );
    },
});
