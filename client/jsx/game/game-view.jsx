//ゲームをアレする
var extend=require('extend');
var React=require('react/addons');

var masao=require('../../../lib/masao');

module.exports = React.createClass({
    displayName:"GameView",
    mixins:[React.addons.PureRenderMixin],
    propTypes:{
        game: React.PropTypes.object,
        audio_enabled: React.PropTypes.bool,
        //プレイログをとってほしい場合
        playlogCallback: React.PropTypes.func,
        //プレイログを再生してほしい場合
        playlog: React.PropTypes.object
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
        if(prevProps.game!==this.props.game || prevProps.playlogCallback!==this.props.playlogCallback || prevProps.playlog != this.props.playlog){
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
        //CanvasMasaoのオプション
        var options = {
            extensions: []
        };
        if(game.version==="kani2"){
            //MasaoKani2だ
            options.extensions.push(CanvasMasao.MasaoKani2);
        }
        if(this.props.playlog!=null){
            //再生する
            options.extensions.push(CanvasMasao.InputPlayer);
            options.inputdata = this.props.playlog;
        }else if(this.props.playlogCallback!=null){
            //playlogをとってほしい
            options.extensions.push(CanvasMasao.InputRecorder);
            options.inputdataCallback=this.props.playlogCallback;
            options.requiresCallback = (obj)=>{
                return true;
            };
        }

        if(game.version==="2.8"){
            //2.8だ
            this.game=new CanvasMasao_v28.Game(p,this.gameid, options);
        }else{
            this.game=new CanvasMasao.Game(p,this.gameid,options);
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
