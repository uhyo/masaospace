var React = require('react');

var api=require('../../../actions/api');
var Loading=require('../../commons/loading.jsx'),
    GameTile=require('./game-tile.jsx');

module.exports = React.createClass({
    displayName:"QueryList",
    propTypes:{
        query:React.PropTypes.shape({
            owner: React.PropTypes.string
        }).isRequired
    },
    getInitialState:function(){
        return {
            loading: true,
            page:0,
            limit:50,
            games: []
        };
    },
    componentDidMount:function(){
        var query=this.props.query;
        api("/api/game/find",{
            owner: query.owner,

            skip: this.state.page*this.state.limit,
            limit: this.state.limit
        }).then((result)=>{
            console.log(result);
            this.setState({
                loading: false,
                games: result.metadatas
            });
        });
    },
    render:function(){
        if(this.state.loading){
            //ローディング状態
            return <Loading/>;
        }
        //ゲームたちを表示
        var games=this.state.games;
        var len=games.len;
        return (
            <div className="game-query-list">{
                games.map((obj,i)=>{
                    return <GameTile key={i} metadata={obj} />;
                })
            }</div>
        );
    }
});
