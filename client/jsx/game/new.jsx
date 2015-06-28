var React = require('react');

var MasaoSelector = require('./masao-selector.jsx');
var GameMetadataForm = require('./game-metadata-form.jsx');

module.exports = React.createClass({
    displayName:"New",
    getInitialState:function(){
        return {
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
        return <GameMetadataForm onChange={this.handleMetadata} />;
    }
});
