var React = require('react');

var GameView=require('./game-view.jsx'),
    UserTile=require('./parts/user-tile.jsx'),
    Datetime=require('../commons/datetime.jsx'),
    GameComment=require('./parts/game-comment.jsx');


module.exports = React.createClass({
    displayName:"Play",
    propTypes:{
        game: React.PropTypes.object.isRequired,
        metadata: React.PropTypes.object.isRequired,
        owner: React.PropTypes.object.isRequired,

        config: React.PropTypes.object.isRequired,
        session: React.PropTypes.object.isRequired
    },
    render:function(){
        var metadata=this.props.metadata, session=this.props.session;
        var ownertools = null;
        if(session.user===metadata.owner){
            //わたしがオーナーだ！
            ownertools = <p>
                <a href={`/game/edit/${metadata.id}`}>
                    <span className="icon icon-edit"/>
                    <span>正男を編集</span>
                </a>
            </p>;
        }
        return (
            <section>
                <h1>{metadata.title}</h1>
                <div className="game-play-container">
                    <GameView game={this.props.game} />
                </div>
                <div className="game-play-info">
                    <div className="game-play-info-meta">
                        <p><Datetime date={new Date(metadata.created)} /> 投稿</p>
                        {ownertools}
                        <UserTile {...this.props.owner} label="投稿者" />
                    </div>
                    <div className="game-play-info-description">
                        <p>{metadata.description}</p>
                    </div>
                </div>
                <GameComment game={metadata.id} config={this.props.config} session={session} />
            </section>
        );
    }
});
