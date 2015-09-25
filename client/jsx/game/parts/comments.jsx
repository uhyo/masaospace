var React=require('react');
//comments list

var UserTile=require('./user-tile.jsx'),
    Datetime=require('../../commons/datetime.jsx'),
    RichText=require('../../commons/rich-text.jsx');

module.exports = React.createClass({
    displayName:"Comments",
    propTypes:{
        comments: React.PropTypes.array.isRequired
    },
    render(){
        var comments=this.props.comments;
        if(comments.length===0){
            return <p>コメントはまだありません。</p>;
        }
        return <div>{
            comments.map((obj,i)=>{
                return <div key={i} className="comments-comment">
                    <div className="comments-user">
                        <UserTile id={obj.userid} {...obj.user} label="投稿者" fullWidth/>
                    </div>
                    <div className="comments-body">
                        <div className="comments-text">
                            <RichText text={obj.comment}/>
                        </div>
                        <p className="comments-time"><Datetime date={new Date(obj.time)} /> 投稿</p>
                    </div>
                </div>;
            })
        }</div>;
    }
});
