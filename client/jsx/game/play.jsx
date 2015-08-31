var React = require('react');

var queryString=require('query-string'),
    path=require('../../scripts/path');

var GameView=require('./game-view.jsx'),
    UserTile=require('./parts/user-tile.jsx'),
    Datetime=require('../commons/datetime.jsx'),
    GameComment=require('./parts/game-comment.jsx');


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
        return (
            <section>
                <h1>{metadata.title}</h1>
                <div className="game-play-container">
                    <GameView game={this.props.game} />
                </div>
                <div className="game-play-info">
                    <div className="game-play-info-meta">
                        <p><Datetime date={new Date(metadata.created)} /> 投稿</p>
                        <p>閲覧数 {metadata.playcount}</p>
                        {ownertools}
                        <UserTile {...this.props.owner} label="投稿者" fullWidth/>
                    </div>
                    <div className="game-play-info-description">
                        <div className="game-play-info-message">
                            <p>{metadata.description}</p>
                        </div>
                        {tags}
                        {seriesArea}
                    </div>
                </div>
                <GameTools config={this.props.config} metadata={metadata}/>
                <GameComment game={metadata.id} config={this.props.config} session={session} />
            </section>
        );
    }
});

var GameTools = React.createClass({
    displayName:"GameTools",
    propTypes:{
        config: React.PropTypes.object.isRequired,
        metadata: React.PropTypes.object.isRequired
    },
    getInitialState(){
        return {
            code: false
        };
    },
    render(){
        var metadata=this.props.metadata;
        var code=null;
        if(this.state.code===true){
            code=<div className="game-play-tools-code">
                <p>正男を埋め込みたい箇所に以下のHTMLコードを貼り付けてください。</p>
                <pre><code>{
                    `<iframe src="${this.props.config.service.url}embed/${metadata.id}" width="514" height="434" style="border:none"></iframe>`
                }</code></pre>
            </div>;
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
    }
});
