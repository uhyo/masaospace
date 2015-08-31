var React=require('react');
var extend=require('extend');

var Datetime=require('../commons/datetime.jsx'),
    UserTile=require('../game/parts/user-tile.jsx'),
    GameList=require('../game/parts/game-list.jsx');

module.exports = React.createClass({
    displayName: "SeriesPage",
    propTypes:{
        series: React.PropTypes.object.isRequired,
        owner: React.PropTypes.object.isRequired,
        metadatas: React.PropTypes.arrayOf(React.PropTypes.object.isRequired).isRequired
    },
    render(){
        var series=this.props.series, owner=this.props.owner;
        var metadatas = this.props.metadatas.map((metadata)=>{
            return extend({},metadata,{
                user: owner
            });
        });
        return <section className="series-page">
            <h1>シリーズ: {series.name}</h1>
            <div className="game-play-info">
                <div className="game-play-info-meta">
                    <p><Datetime date={new Date(series.created)}/> 作成</p>
                    <UserTile {...owner} label="作成者" fullWidth/>
                </div>
                <div className="game-play-info-description">
                    <div className="game-play-info-message">
                        <p>{series.description}</p>
                    </div>
                </div>
            </div>
            <GameList games={metadatas} zero="このシリーズには正男が登録されていません。" />
        </section>;
    }
});
