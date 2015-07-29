var React = require('react');

module.exports = React.createClass({
    displayName:"UserTile",
    propTypes:{
        id:React.PropTypes.string.isRequired,
        screen_name:React.PropTypes.string.isRequired,
        name:React.PropTypes.string.isRequired,

        label:React.PropTypes.string.isRequired
    },
    render(){
        var props=this.props;
        return (
            <a className="user-tile" href={`/${props.screen_name}`}>
                <div>
                    <span className="user-tile-name">{props.label}</span>
                    <span className="user-tile-user">{props.name}</span>
                </div>
            </a>
        );
    }
});
