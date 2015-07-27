var React = require('react');

var GameView=require('./game-view.jsx'),
    UserTile=require('./parts/user-tile.jsx'),
    Datetime=require('../commons/datetime.jsx');


module.exports = React.createClass({
    displayName:"Play",
    propTypes:{
        game: React.PropTypes.object.isRequired,
        metadata: React.PropTypes.object.isRequired,
        owner: React.PropTypes.object.isRequired,
        session: React.PropTypes.object.isRequired
    },
    render:function(){
        var metadata=this.props.metadata;
        return (
            <section>
                <h1>{metadata.title}</h1>
                <div className="game-play-container">
                    <GameView game={this.props.game} />
                </div>
                <div className="game-play-info">
                    <div className="game-play-info-meta">
                        <p><Datetime date={new Date(metadata.created)} /> 投稿</p>
                        <UserTile {...this.props.owner} label="投稿者" />
                    </div>
                    <div className="game-play-info-description">
                        <p>{metadata.description}</p>
                    </div>
                </div>
            </section>
        );
    }
});
