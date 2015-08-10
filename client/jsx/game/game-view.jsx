//ゲームをアレする
var extend=require('extend');
var React=require('react/addons');

var masao=require('../../../lib/masao');

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
        if(this.gameid==null){
            this.gameid=Math.random().toString(36).slice(2);
        }
        React.findDOMNode(this).id=this.gameid;
        var p=masao.localizeGame(game);
        if(game.version==="2.8"){
            //2.8だ
            this.game=new CanvasMasao_v28.Game(p,this.gameid);
        }else{
            this.game=new CanvasMasao.Game(p,this.gameid);
        }
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
