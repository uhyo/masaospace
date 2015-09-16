var React=require('react');

var Datetime=require('../../commons/datetime.jsx'),
    UserTile=require('./user-tile.jsx');

module.exports = React.createClass({
    displayName:"GameTile",
    propTypes:{
        metadata:React.PropTypes.shape({
            id:React.PropTypes.number,
            owner:React.PropTypes.string,
            title:React.PropTypes.string,
            level:React.PropTypes.number,
            description:React.PropTypes.string,
            hidden:React.PropTypes.bool,
            created:React.PropTypes.oneOfType([
                React.PropTypes.string,
                React.PropTypes.instanceOf(Date)
            ]),
            updated:React.PropTypes.oneOfType([
                React.PropTypes.string,
                React.PropTypes.instanceOf(Date)
            ]),
            user:React.PropTypes.object
        })
    },
    render:function(){
        var metadata=this.props.metadata;
        var hiddenFlag=null;
        if(metadata.hidden===true){
            hiddenFlag="（非公開）";
        }
        return (
            <div className="game-tile">
                <p className="game-tile-title"><a href={"/play/"+metadata.id}>{metadata.title}</a></p>
                <p className="game-tile-time">投稿日時：<Datetime date={new Date(this.props.metadata.created)} />{hiddenFlag}</p>
                {metadata.user ? <UserTile id={metadata.owner} label="投稿者" {...metadata.user} fullWidth/> : null}
            </div>
        );
    },
});

