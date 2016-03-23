//iframeでゲームを表示するやつ
var React=require('react/addons');
var crypto=require('crypto');
var randomString=require('random-string');

module.exports = React.createClass({
    displayName:"SafeGameView",
    mixins:[React.addons.PureRenderMixin],
    propTypes:{
        game: React.PropTypes.object,
        config: React.PropTypes.object.isRequired,
        session: React.PropTypes.object.isRequired,
        //TODO: audio_enabledに対応してない
        audio_enabled: React.PropTypes.bool,
    },
    componentWillReceiveProps(nextProps){
        this.setState({
            confirm: false
        });
    },
    getInitialState(){
        return {
            //実行を承諾
            confirm: false
        };
    },
    render(){
        var {game, config, audio_enabled} = this.props;
        var content;
        if(this.state.confirm){
            //了承済
            content = <iframe className="game-safe-view" sandbox="allow-scripts" src={`//${config.service.sandboxDomain}/sandbox/${game.id}`} width="512" height="320" />;
        }else{
            //警告を表示
            content = <div className="game-safe-view-confirm" onClick={this.handleClick}>
                <p>
                    <span className="icon icon-warning"/>
                    JavaScript拡張がある正男です。
                </p>
                <p>JavaScriptが実行されると、ブラウザや端末に負荷をかけたり、脆弱性を持つウェブサービスを攻撃されたりする恐れがあります。</p>
                <p>この正男の作者を信頼できない場合、正男を表示しないでください。</p>
                <div className="game-safe-view-confirm-button">
                    正男を表示
                </div>
            </div>;
        }
        return (
            <div className="game-view">{
                content
            }</div>
        );
    },
    handleClick(e){
        e.preventDefault();
        this.setState({
            confirm: true
        });
    },
});
