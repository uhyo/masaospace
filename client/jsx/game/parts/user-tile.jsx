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
            <a className="user-tile" href={`/${props.screen_name}`}>
                <div>
                    <span className="user-tile-name">{props.label}</span>
                    <span className="user-tile-user">{props.name}</span>
                </div>
            </a>
        );
    }
});
