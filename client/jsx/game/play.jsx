var React = require('react');

var queryString=require('query-string'),
    scrollIntoView=require('dom-scroll-into-view'),
    path=require('../../scripts/path');

var GameView=require('./game-view.jsx'),
    UserTile=require('./parts/user-tile.jsx'),
    Datetime=require('../commons/datetime.jsx'),
    RichText=require('../commons/rich-text.jsx'),
    GameComment=require('./parts/game-comment.jsx'),
    PlaylogList=require('./parts/playlog-list.jsx');


module.exports = React.createClass({
    displayName:"Play",
    propTypes:{
        game: React.PropTypes.object.isRequired,
        metadata: React.PropTypes.object.isRequired,
        owner: React.PropTypes.object.isRequired,
        series: React.PropTypes.arrayOf(React.PropTypes.shape({
            id: React.PropTypes.number.isRequired,
            name: React.PropTypes.string.isRequired,
            prev: React.PropTypes.number,
            next: React.PropTypes.number
        })),

        config: React.PropTypes.object.isRequired,
        session: React.PropTypes.object.isRequired
    },
    getInitialState(){
        return {
            audio_switch: true,
            playlog_switch: true,
            //保存したプレイログ
            playlog_score: null,    //スコアがいちばん
            playlog_clear: null,     //進みがいちばん
            //今プレイ中のプレイログ（データのみ）
            playlog_playing_data: null
        };
    },
    render:function(){
        var metadata=this.props.metadata, series=this.props.series, session=this.props.session;
        var ownertools = null;
        if(session.user===metadata.owner){
            //わたしがオーナーだ！
            ownertools = <p>
                <a href={`/game/edit/${metadata.id}`}>
                    <span className="icon icon-edit"/>
                    <span>正男を編集</span>
                </a>
            </p>;
        }
        var hiddenInfo = null;
        if(metadata.hidden===true){
            hiddenInfo=<strong>（非公開）</strong>;
        }
        var tags=null;
        if(metadata.tags && metadata.tags.length>0){
            //タグがあった
            tags=<div className="game-play-info-tags">
                <div><span className="icon icon-tag"/></div>
                <ul>{
                    metadata.tags.map((tag,i)=>{
                        return <li key={i}>
                            <a href={path.gameListByTag(tag)}>{tag}</a>
                        </li>;
                    })
                }</ul>
            </div>;
        }
        var seriesArea=null;
        if(series.length>0){
            seriesArea=<div className="game-play-info-series">{
                series.map((s)=>{
                    var prev=null, next=null;
                    if(s.prev!=null){
                        prev=<span>
                            <a href={`/play/${s.prev}`}>前の正男</a>
                        </span>;
                    }
                    if(s.next!=null){
                        next=<span>
                            {prev!=null ? "｜" : null}<a href={`/play/${s.next}`}>次の正男</a>
                        </span>;
                    }
                    return <p key={s.id}>
                        シリーズ: <b><a href={`/series/${s.id}`}>{s.name}</a></b>&#x3000;
                        {prev}
                        {next}
                    </p>;
                })
            }</div>;
        }
        var audioLink={
            value: this.state.audio_switch,
            requestChange:(v)=>{
                this.setState({
                    audio_switch: v
                });
            }
        };

        //プレイログをとったら表示
        var playlogArea=null;
        //プレイログ
        var playlogs = this.state.playlog_score!=null ?
            (this.state.playlog_score!==this.state.playlog_clear ?
                [this.state.playlog_clear, this.state.playlog_score] :
                [this.state.playlog_score]) :
            (this.state.playlog_clear!=null ?
                [this.state.playlog_clear] : []);
        var player = null;
        if(playlogs.length>0 || this.state.playlog_playing_data!=null){
            var stopper = null;
            if(this.state.playlog_playing_data!=null){
                var clickHandler=(e)=>{
                    e.preventDefault();
                    this.setState({
                        playlog_playing_data:null
                    });
                };
                stopper = <p>
                    <span className="clickable" onClick={clickHandler}>再生を停止</span>
                </p>;
            }
            var player = null;
            if(this.state.playlog_score!=null || this.state.playlog_clear!=null){
                var plist = this.state.playlog_score!=null ?
                    (this.state.playlog_score!==this.state.playlog_clear ?
                        [this.state.playlog_clear, this.state.playlog_score] :
                        [this.state.playlog_score]) :
                    (this.state.playlog_clear!=null ?
                        [this.state.playlog_clear] : []);
                var handlePlay=(obj)=>{
                    this.handlePlay(obj.buffer);
                };

                player=<div>
                    <p>保存されたプレイログ：</p>
                    <PlaylogList playlogs={plist} onPlay={handlePlay}/>
                </div>;
            }
            playlogArea = <div className="game-play-logs">
                {stopper}
                {player}
            </div>;
        }
        //gameviewにわたすやつ
        var playlogCallback = null;
        if(this.state.playlog_switch===true && this.state.playlog_playing_data==null){
            playlogCallback = this.handlePlaylog;
        }
        return (
            <section>
                <h1>{metadata.title}</h1>
                <div className="game-play-container" ref="gamecontainer">
                    <GameView game={this.props.game} audio_enabled={this.state.audio_switch} playlogCallback={playlogCallback} playlog={this.state.playlog_playing_data}/>
                </div>
                {playlogArea}
                <div className="game-play-info">
                    <div className="game-play-info-meta">
                        <p><Datetime date={new Date(metadata.created)} /> 投稿</p>
                        <p>閲覧数 {metadata.playcount} {hiddenInfo}</p>
                        {ownertools}
                        <UserTile {...this.props.owner} label="投稿者" fullWidth/>
                    </div>
                    <div className="game-play-info-description">
                        <div className="game-play-info-message">
                            <RichText text={metadata.description}/>
                        </div>
                        {tags}
                        {seriesArea}
                    </div>
                </div>
                <GameTools config={this.props.config} game={this.props.game} metadata={metadata} audioLink={audioLink}/>
                <GameComment game={metadata.id} playlogs={playlogs} config={this.props.config} session={session} onPlay={this.handlePlay}/>
            </section>
        );
    },
    //ゲームからplaylogが来たので
    handlePlaylog(obj){
        var playlog_clear = this.state.playlog_clear, playlog_score = this.state.playlog_score, flag=false;
        console.log(playlog_clear, obj);
        if(playlog_clear==null || obj.cleared && !playlog_clear.cleared || obj.stage>playlog_clear.stage || obj.cleared===playlog_clear.cleared && obj.stage===playlog_clear.stage && obj.score>playlog_clear.score){
            //更新
            playlog_clear = obj;
            flag=true;
        }
        if(playlog_score==null || playlog_score.score < obj.score){
            playlog_score = obj;
            flag=true;
        }
        if(flag===true){
            this.setState({
                playlog_score,
                playlog_clear
            });
        }
    },
    //再生要求
    handlePlay(buffer){
        //表示する
        scrollIntoView(React.findDOMNode(this.refs.gamecontainer), window, {
            onlyScrollIfNeeded: true
        });
        this.setState({
            playlog_playing_data: buffer
        });
    },
});

var GameTools = React.createClass({
    displayName:"GameTools",
    propTypes:{
        config: React.PropTypes.object.isRequired,
        game: React.PropTypes.object.isRequired,
        metadata: React.PropTypes.object.isRequired,
        audioLink: React.PropTypes.shape({
            value: React.PropTypes.bool.isRequired,
            requestChange: React.PropTypes.func.isRequired
        })
    },
    getInitialState(){
        return {
            code: false
        };
    },
    render(){
        var metadata=this.props.metadata, game=this.props.game;
        var code=null;
        if(this.state.code===true){
            code=<div className="game-play-tools-code">
                <p>正男を埋め込みたい箇所に以下のHTMLコードを貼り付けてください。</p>
                <pre><code>{
                    `<iframe src="${this.props.config.service.url}embed/${metadata.id}" width="514" height="434" style="border:none"></iframe>`
                }</code></pre>
            </div>;
        }
        //audio
        var audio=null;
        if(game.params.se_switch==="2" && game.params.fx_bgm_switch==="2" || this.props.game.version!=="fx"){
            //効果音はいらなそう
            audio=<span className="icon icon-sound-off" title="音声はありません。"/>
        }else{
            //効果音がありそう
            if(this.props.audioLink && this.props.audioLink.value===true){
                audio=<span className="icon icon-sound clickable" title="音声がONになっています。" onClick={this.handleAudioClick}/>
            }else{
                audio=<span className="icon icon-sound-off clickable" title="音声がOFFになっています。" onClick={this.handleAudioClick}/>
            }
        }
        //social
        var url=this.props.config.service.url+"play/"+metadata.id;
        var title=metadata.title + " | "+this.props.config.service.name;
        var twttrQ=queryString.stringify({
            url:url,
            text: title
        }), facebookQ=queryString.stringify({
            u: url
        }), googleQ=queryString.stringify({
            url:url
        });
        return <div className="game-play-tools">
            <div className="game-play-tools-bar">
                <div className="game-play-tools-code-link">
                    <a href={`/play/${metadata.id}`} className="nop" onClick={this.handleCode}>ウェブページに埋め込む...</a>
                </div>
                <div className="game-play-tools-audio">
                    {audio}
                </div>
                <div className="game-play-tools-social">
                    <span className="game-play-tools-social-label">共有：</span>
                    <a href={"https://twitter.com/share?"+twttrQ} target="_blank" title="Twitterでツイート"><span className="icon icon-twitter" /></a>
                    <a href={"https://www.facebook.com/sharer/sharer.php?"+facebookQ} target="_blank" title="Facebookでシェア"><span className="icon icon-facebook" /></a>
                    <a href={"https://plus.google.com/share?"+googleQ} target="_blank" title="Google+でシェア"><span className="icon icon-googleplus" /></a>
                </div>
            </div>
            {code}
        </div>;
    },
    handleCode(e){
        e.preventDefault();
        this.setState({
            code: !this.state.code
        });
    },
    handleAudioClick(e){
        e.preventDefault();
        if(this.props.audioLink){
            this.props.audioLink.requestChange(!this.props.audioLink.value);
        }
    }
});
