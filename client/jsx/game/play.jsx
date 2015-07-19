var React = require('react');

var GameView=require('./game-view.jsx'),
    UserTile=require('./parts/user-tile.jsx');


module.exports = React.createClass({
    displayName:"Play",
    propTypes:{
        game: React.PropTypes.object,
        metadata: React.PropTypes.object,
        owner: React.PropTypes.object
    },
    render:function(){
        var metadata=this.props.metadata;
        return (
            <section>
                <h1>{metadata.title}</h1>
                <GameView game={this.props.game} />
                <UserTile {...this.props.owner} label="投稿者" />
                <p className="game-description">{metadata.description}</p>
            </section>
        );
    }
});
