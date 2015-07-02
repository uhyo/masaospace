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
        this.setState({
            metadata: metadata
        });
    },
    handleSubmit:function(){
        //正男を投稿

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
                <p><input type="button" value="投稿する" onClick={this.handleSubmit} /></p>
            </div>
        );
    }
});
