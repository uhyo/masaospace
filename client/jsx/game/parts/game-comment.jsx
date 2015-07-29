var React=require('react');

var api=require('../../../actions/api');

var errorStore=require('../../../stores/error');

var Loading=require('../../commons/loading.jsx'),
    NeedLogin=require('../../commons/need-login.jsx'),
    CommentForm=require('./comment-form.jsx'),
    Comments=require('./comments.jsx');


module.exports = React.createClass({
    displayName:"GameComment",
    propTypes:{
        game: React.PropTypes.number.isRequired,
        config: React.PropTypes.object.isRequired,
        session: React.PropTypes.object.isRequired,
    },
    getInitialState(){
        return {
            loading: true,
            comments: null
        };
    },
    componentDidMount(){
        this.load();
    },
    handleComment(){
        this.load()
    },
    load(){
        //request
        api("/api/comment/find",{
            game: this.props.game,
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
        var commentForm, comments;
        if(this.props.session.loggedin===false){
            //未ログイン
            commentForm=<NeedLogin>
                <p>コメントを投稿するにはログインする必要があります。</p>
            </NeedLogin>;
        }else{
            commentForm=<CommentForm game={this.props.game} config={this.props.config} session={this.props.session} onComment={this.handleComment}/>
        }
        if(this.state.loading===true){
            comments=<Loading/>;
        }else{
            comments=<Comments comments={this.state.comments} />;
        }
        return <section className="game-play-comments">
            <h1>コメント</h1>
            {commentForm}
            {comments}
        </section>;
    },
});
