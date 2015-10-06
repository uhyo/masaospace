var React=require('react');
//comments list

var api=require('../../../actions/api');

var errorStore=require('../../../stores/error');

var UserTile=require('./user-tile.jsx'),
    Datetime=require('../../commons/datetime.jsx'),
    RichText=require('../../commons/rich-text.jsx');

module.exports = React.createClass({
    displayName:"Comments",
    propTypes:{
        comments: React.PropTypes.array.isRequired,
        onPlay: React.PropTypes.func.isRequired
    },
    render(){
        var comments=this.props.comments;
        if(comments.length===0){
            return <div className="comments-comment-none">
                <p>コメントはまだありません。</p>
            </div>
        }
        return <div>{
            comments.map((obj,i)=>{
                var playlogArea=null;
                if(obj.playlog!=null){
                    playlogArea=<div className="comments-playlog">
                        <p>{obj.cleared===true ? <span className="comments-playlog-cleared">★</span> : null}スコア: {obj.score}　<span className="clickable" onClick={this.handlePlay(obj.playlog)}>再生</span></p>
                        {obj.cleard!==true && obj.stage>0 ? <p>ステージ{obj.stage}までクリア</p> : null}
                        <p></p>
                    </div>;
                }
                return <div key={obj.id} className="comments-comment">
                    <div className="comments-info">
                        <UserTile id={obj.userid} {...obj.user} label="投稿者" fullWidth/>
                        {playlogArea}
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
    },
    //プレイログを再生する関数を返す
    handlePlay(playlogid){
        return (e)=>{
            e.preventDefault();
            //ログをもらう
            api("/api/playlog/get",{
                id: playlogid
            },null,true).then((buf)=>{
                this.props.onPlay(buf);
            })
            .catch(errorStore.emit);
        };
    }
});
