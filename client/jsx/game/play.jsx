var React = require('react');

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

        config: React.PropTypes.object.isRequired,
        session: React.PropTypes.object.isRequired
    },
    render:function(){
        var metadata=this.props.metadata, session=this.props.session;
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
        return (
            <section>
                <h1>{metadata.title}</h1>
                <div className="game-play-container">
                    <GameView game={this.props.game} />
                </div>
                <div className="game-play-info">
                    <div className="game-play-info-meta">
                        <p><Datetime date={new Date(metadata.created)} /> 投稿</p>
                        {ownertools}
                        <UserTile {...this.props.owner} label="投稿者" fullWidth/>
                    </div>
                    <div className="game-play-info-description">
                        <p>{metadata.description}</p>
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
        return <div className="game-play-tools">
            <div>
                <a href={`/play/${metadata.id}`} className="nop" onClick={this.handleCode}>ウェブページに埋め込む...</a>
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
