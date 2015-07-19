var React = require('react');

module.exports = React.createClass({
    displayName:"UserTile",
    propTypes:{
        id:React.PropTypes.string,
        screen_name:React.PropTypes.string,
        name:React.PropTypes.string,

        label:React.PropTypes.string
    },
    render(){
        var props=this.props;
        return (
            <div className="user-tile">
                <p>{props.label}</p>
                <p><a href={`/${props.screen_name}`}>{props.name}</a></p>
            </div>
        );
    }
});
