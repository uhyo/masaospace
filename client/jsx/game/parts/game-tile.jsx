var React=require('react');

module.exports = React.createClass({
    displayName:"GameTile",
    propTypes:{
        metadata:React.PropTypes.shape({
            id:React.PropTypes.number,
            owner:React.PropTypes.string,
            title:React.PropTypes.string,
            level:React.PropTypes.number,
            description:React.PropTypes.string,
            created:React.PropTypes.string,
            updated:React.PropTypes.string
        })
    },
    render:function(){
        var metadata=this.props.metadata;
        return (
            <div className="game-tile">
                <a href={"/play/"+metadata.id}>{metadata.title}</a>
            </div>
        );
    },
});

