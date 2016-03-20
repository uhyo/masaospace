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
    render(){
        const {game, config} = this.props;
        return (
            <div className="game-view">
                <iframe src={`//${config.service.sandboxDomain}/sandbox/${game.id}`} width="512" height="320" />
            </div>
        );
    }
});
