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
        var p=extend({},game.params);
        if(this.gameid==null){
            this.gameid=Math.random().toString(36).slice(2);
        }
        React.findDOMNode(this).id=this.gameid;
        //disable SE (SE is TODO)
        p["se_switch"]="2";
        //デフォルトのリソースをセットする
        for(var key in masao.resourceToKind){
            var kind=masao.resourceToKind[key];
            //kindの一覧はlib/masao.jsのresourceKindsに
            var value;
            switch(kind){
                case "pattern":
                    value="/static/pattern.gif";
                break;
                case "title":
                    value="/static/title.gif";
                break;
                case "ending":
                    value="/static/ending.gif";
                break;
                case "gameover":
                    value="/static/gameover.gif";
                break;
                case "mapchip":
                    value="/static/mapchip.gif";
                break;
                case "chizu":
                    value="/static/chizu.gif";
                break;
                case "haikei":
                    value="/static/haikei.gif";
                break;
                case "bgm":
                case "se":
                case "other":
                    //TODO
                    value="";
                break;
            }
            p[key]=value;
        }
        //カスタムリソースをセット
        var resources=game.resources;
        for(var i=0;i < resources.length; i++){
            if(resources[i].target in masao.resources){
                p[resources[i].target] = "/uploaded/"+resources[i].id;
            }
        }
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
