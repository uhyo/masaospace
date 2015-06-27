//ゲームをアレする
var React=require('react');

module.exports = React.createClass({
    displayName:"GameView",
    propTypes:{
        game: React.PropTypes.object
    },
    getInitialState:function(){
        return {
        };
    },
    componentWillMount:function(){
        this.setState({
            gameid: Math.random().toString(36).slice(2)
        });
    },
    componentDidMount:function(){
        this.game=new CanvasMasao.Game(this.props.game.params,this.state.gameid);
    },
    componentWiiiUnMount:function(){
        this.game.__mc.stop();
        this.game.__mc.destroy();
        /* 手動でcleanする */
        var d=React.findDOMNode(this);
        while(d.firstChild){
            d.removeChild(d.firstChild);
        }
    },
    render:function(){
        return (
            <div id={this.state.gameid} />
        );
    }
});
