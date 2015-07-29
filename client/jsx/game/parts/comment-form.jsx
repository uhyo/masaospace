var React=require('react/addons');

var api=require('../../../actions/api');
var errorStore=require('../../../stores/error');


module.exports = React.createClass({
    displayName:"CommentForm",
    mixins:[React.addons.LinkedStateMixin],
    propTypes:{
        game: React.PropTypes.number.isRequired,
        config: React.PropTypes.object.isRequired,

        onComment: React.PropTypes.func
    },
    getInitialState(){
        return {
            comment:""
        };
    },
    handleSubmit(e){
        e.preventDefault();
        api("/api/comment/new",{
            game: this.props.game,
            comment: this.state.comment
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
