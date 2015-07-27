//ゲームをアレする
var deepExtend=require('deep-extend');
var React=require('react/addons');

module.exports = React.createClass({
    displayName:"GameView",
    mixins:[React.addons.PureRenderMixin],
    propTypes:{
        game: React.PropTypes.object
    },
    getInitialState:function(){
        return {
        };
    },
    componentDidMount:function(){
        this.setGame(this.props.game);
    },
    componentWiiiUnMount:function(){
        this.endGame();
    },
    componentDidUpdate:function(prevProps, prevState){
        this.endGame();
        this.setGame(this.props.game);
    },
    setGame:function(game){
        var p=deepExtend({},game.params);
        if(this.gameid==null){
            this.gameid=Math.random().toString(36).slice(2);
        }
        React.findDOMNode(this).id=this.gameid;
        /* set images */
        //TODO: custom images
        p["filename_title"]="/static/title.gif";
        p["filename_ending"]="/static/ending.gif";
        p["filename_gameover"]="/static/gameover.gif";
        p["filename_pattern"]="/static/pattern.gif";
        p["filename_haikei"]="/static/haikei.gif";
        p["se_switch"]="2";
        this.game=new CanvasMasao.Game(p,this.gameid);
    },
    endGame:function(){
        if(this.game==null){
            return;
        }
        this.game.__mc.stop();
        this.game.__mc.destroy();
        /* 手動でcleanする */
        var d=React.findDOMNode(this);
        d.id=null;
        while(d.firstChild){
            d.removeChild(d.firstChild);
        }
        this.game=null;
    },
    render:function(){
        return (
            <div className="game-view" />
        );
    }
});
