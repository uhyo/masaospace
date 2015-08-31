var React = require('react');

var api=require('../../../actions/api');
var Loading=require('../../commons/loading.jsx'),
    GameList=require('./game-list.jsx');

module.exports = React.createClass({
    displayName:"QueryList",
    propTypes:{
        query:React.PropTypes.shape({
            owner: React.PropTypes.string,
            tag: React.PropTypes.string
        }).isRequired,
        limit:React.PropTypes.number
    },
    getInitialState:function(){
        return {
            loading: true,
            page:0,
            games: []
        };
    },
    getDefaultProps:function(){
        return {
            limit: 50
        };
    },
    componentDidMount:function(){
        var query=this.props.query;
        api("/api/game/find",{
            owner: query.owner,
            tag: query.tag,

            skip: this.state.page*this.props.limit,
            limit: this.props.limit
        }).then((result)=>{
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
        return <GameList games={this.state.games} zero="正男が見つかりませんでした。" />;
    }
});
