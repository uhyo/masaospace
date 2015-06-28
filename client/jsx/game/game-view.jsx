//ゲームをアレする
var deepExtend=require('deep-extend');
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
        var p=deepExtend({},this.props.game.params);
        /* set images */
        //TODO: custom images
        p["filename_title"]="/static/title.gif";
        p["filename_ending"]="/static/ending.gif";
        p["filename_gameover"]="/static/gameover.gif";
        p["filename_pattern"]="/static/pattern.gif";
        this.game=new CanvasMasao.Game(p,this.state.gameid);
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
