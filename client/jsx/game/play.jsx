var React = require('react');

var GameView=require('./game-view.jsx');

module.exports = React.createClass({
    displayName:"Play",
    propTypes:{
        game: React.PropTypes.object,
        metadata: React.PropTypes.object
    },
    render:function(){
        return (
            <section>
                <h1>{this.props.metadata.title}</h1>
                <GameView game={this.props.game} />
            </section>
        );
    }
});
