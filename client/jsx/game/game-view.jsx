//ゲームをアレする
var extend=require('extend');
var React=require('react/addons');

var masao=require('../../../lib/masao');

module.exports = React.createClass({
    displayName:"GameView",
    mixins:[React.addons.PureRenderMixin],
    propTypes:{
        game: React.PropTypes.object,
        audio_enabled: React.PropTypes.bool
    },
    getInitialState:function(){
        return {
        };
    },
    componentDidMount:function(){
        this.setGame(this.props.game);
    },
    componentWillUnmount:function(){
        this.endGame();
    },
    componentDidUpdate:function(prevProps, prevState){
        if(prevProps.game!==this.props.game){
            this.endGame();
            this.setGame(this.props.game);
        }else if(prevProps.audio_enabled!==this.props.audio_enabled){
            if(this.props.audio_enabled){
                if(this.game.__mc && this.game.__mc.soundOn){
                    this.game.__mc.soundOn();
                }
            }else{
                if(this.game.__mc && this.game.__mc.soundOff){
                    this.game.__mc.soundOff();
                }
            }
        }
    },
    setGame:function(game){
        if(this.gameid==null){
            this.gameid=Math.random().toString(36).slice(2);
        }
        React.findDOMNode(this).id=this.gameid;
        var p=masao.localizeGame(game);
        console.log("p",p);
        if(game.version==="2.8"){
            //2.8だ
            this.game=new CanvasMasao_v28.Game(p,this.gameid);
        }else if(game.version==="kani2"){
            //MasaoKani2だ
            this.game=new CanvasMasao.Game(p,this.gameid,{
                extensions: [CanvasMasao.MasaoKani2]
            });
        }else{
            this.game=new CanvasMasao.Game(p,this.gameid,{
                extensions: [CanvasMasao.InputRecorder],
                inputdataCallback: (result)=>{
                    console.log(result);
                }
            });
        }
        if(this.props.audio_enabled!==true){
            if(this.game.__mc && this.game.__mc.soundOff){
                this.game.__mc.soundOff();
            }
        }
    },
    endGame:function(){
        if(this.game==null){
            return;
        }
        this.game.kill();
        this.game=null;
    },
    render:function(){
        return (
            <div className="game-view" />
        );
    }
});
