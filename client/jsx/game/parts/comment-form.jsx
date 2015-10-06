var React=require('react/addons');

var base64ArrayBuffer=require('base64-arraybuffer');

var api=require('../../../actions/api');
var errorStore=require('../../../stores/error');


module.exports = React.createClass({
    displayName:"CommentForm",
    mixins:[React.addons.LinkedStateMixin],
    propTypes:{
        game: React.PropTypes.number.isRequired,
        config: React.PropTypes.object.isRequired,
        playlog: React.PropTypes.object,    //ArrayBuffer?

        onComment: React.PropTypes.func
    },
    getInitialState(){
        return {
            comment:""
        };
    },
    handleSubmit(e){
        e.preventDefault();
        console.log(this.props);
        api("/api/comment/new",{
            game: this.props.game,
            comment: this.state.comment,
            playlog: this.props.playlog && base64ArrayBuffer.encode(this.props.playlog)
        })
        .then(()=>{
            if("function"===typeof this.props.onComment){
                this.props.onComment();
            }
        })
        .catch(errorStore.emit);
        //フォームを初期化
        this.setState({
            comment:""
        });
    },
    render(){
        //コメント投稿フォーム
        return <form className="form" onSubmit={this.handleSubmit}>
            <p>
                <label className="form-row">
                    <textarea className="form-single" required valueLink={this.linkState("comment")} maxLength={this.props.config.comment.maxLength} />
                </label>
            </p>
            <p>
                <input type="submit" className="form-single form-button" value="コメントを投稿する" />
            </p>
        </form>;
    }
});
