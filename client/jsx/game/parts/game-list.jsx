var React=require('react');

var GameTile=require('./game-tile.jsx');

module.exports = React.createClass({
    displayName:"GameList",
    propTypes:{
        games: React.PropTypes.arrayOf(React.PropTypes.object.isRequired).isRequired,
        zero: React.PropTypes.string
    },
    getDefaultProps(){
        return {
            zero: "正男が見つかりませんでした。"
        };
    },
    render(){
        var games=this.props.games, len=games.length;
        if(len===0){
            return <div className="game-list">
                <p>{this.props.zero}</p>
            </div>;
        }
        return <div className="game-list">{
            games.map((obj,i)=>{
                return <GameTile key={obj.id} metadata={obj} />;
            })
        }</div>;

    }
});
