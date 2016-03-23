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
        if(this.props.game!==nextProps.game){
            //ゲームが変わったら再度確認
            this.setState({
                confirm: false
            });
        }
    },
    componentDidUpdate(prevProps, prevState){
        if(prevProps.audio_enabled !== this.props.audio_enabled && this.state.confirm===true){
            //音声の有無が変わったからゲームに通知しないと
            this.setAudio(this.props.audio_enabled);
        }
    },
    setAudio(audio_enabled){
        var iframe = React.findDOMNode(this.refs.frame);
        var w = iframe.contentWindow;
        if(w==null){
            return;
        }
        //音声のあれの指令を出す
        w.postMessage({
            message: "audio_enabled",
            audio_enabled: audio_enabled
        }, "*");
        console.log("yes, audio", audio_enabled);
    },
    getInitialState(){
        return {
            //実行を承諾
            confirm: false,
            //iframeのURLに使う用のaudio_enablde
            initial_audio_enabled: true
        };
    },
    render(){
        var {game, config, audio_enabled} = this.props;
        var content;
        if(this.state.confirm){
            //了承済
            var au = this.state.initial_audio_enabled ? "?audio_enabled" : "";
            content = <iframe ref="frame" className="game-safe-view" sandbox="allow-scripts" src={`//${config.service.sandboxDomain}/sandbox/${game.id}${au}`} width="512" height="320" />;
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
            confirm: true,
            initial_audio_enabled: this.props.audio_enabled
        });
    },
});
