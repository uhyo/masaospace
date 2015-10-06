var React=require('react');

var api=require('../../../actions/api');

var errorStore=require('../../../stores/error');

var Loading=require('../../commons/loading.jsx'),
    NeedLogin=require('../../commons/need-login.jsx'),
    CommentForm=require('./comment-form.jsx'),
    Comments=require('./comments.jsx'),
    PlaylogList=require('./playlog-list.jsx');


module.exports = React.createClass({
    displayName:"GameComment",
    propTypes:{
        game: React.PropTypes.number.isRequired,
        playlogs: React.PropTypes.array.isRequired,
        config: React.PropTypes.object.isRequired,
        session: React.PropTypes.object.isRequired,
    },
    getInitialState(){
        return {
            loading: true,
            comments: null,
            playlog: null
        };
    },
    componentDidMount(){
        this.load(this.props.game);
    },
    componentWillReceiveProps(nextProps){
        if(this.props.game!==nextProps.game){
            this.load(nextProps.game);
        }
    },
    handleComment(){
        this.setState({
            playlog: null
        });
        this.load(this.props.game)
    },
    load(game){
        //request
        api("/api/comment/find",{
            game,
            skip: 0,
            limit: 50
        })
        .then((obj)=>{
            this.setState({
                loading: false,
                comments: obj.comments
            });
        })
        .catch(errorStore.emit);
    },
    render(){
        //プレイログを選択
        var playlogs = this.props.playlogs, playlogArea=null;
        if(playlogs.length>0){
            var ps=null;
            if(this.state.playlog==null){
                ps=<p>コメントと一緒にプレイログを投稿するには、以下から選択してください。</p>;
            }else{
                var clk=(e)=>{
                    e.preventDefault();
                    this.setState({
                        playlog: null
                    });
                };
                ps=<p><span className="clickable" onClick={clk}>プレイログの投稿を取り消す</span></p>;
            }
            var hp=(obj)=>{
                var idx=this.props.playlogs.indexOf(obj);
                if(idx<0){
                    idx=null;
                }
                this.setState({
                    playlog: idx
                });
            };
            playlogArea=<div className="game-play-comments-playlog">
                {ps}
                <PlaylogList playlogs={playlogs} playString="選択" selected={this.state.playlog} onPlay={hp}/>
            </div>;
        }
        var selectedPlaylog = this.state.playlog==null ? null : this.props.playlogs[this.state.playlog];
        var commentForm, comments;
        if(this.props.session.loggedin===false){
            //未ログイン
            commentForm=<NeedLogin>
                <p>コメントを投稿するにはログインする必要があります。</p>
            </NeedLogin>;
        }else{
            commentForm=<CommentForm game={this.props.game} config={this.props.config} playlog={selectedPlaylog && selectedPlaylog.buffer} session={this.props.session} onComment={this.handleComment}/>
        }
        if(this.state.loading===true){
            comments=<Loading/>;
        }else{
            comments=<Comments comments={this.state.comments} />;
        }
        return <section className="game-play-comments">
            <h1>コメント</h1>
            <div className="game-play-comments-form-wrapper">
                {playlogArea}
                {commentForm}
            </div>
            {comments}
        </section>;
    },
});
