var React = require('react');

var UserIcon = require('../../commons/user-icon.jsx');

module.exports = React.createClass({
    displayName:"UserTile",
    propTypes:{
        id:React.PropTypes.string.isRequired,
        screen_name:React.PropTypes.string.isRequired,
        name:React.PropTypes.string.isRequired,
        icon:React.PropTypes.string,
        url:React.PropTypes.string,

        label:React.PropTypes.string.isRequired,
        fullWidth:React.PropTypes.bool
    },
    render(){
        var props=this.props;
        var className="user-tile";
        if(this.props.fullWidth===true){
            className+=" user-tile-fullwidth";
        }
        var url=null;
        if(this.props.url){
            //プロトコルを除去
            var urlStr=this.props.url;
            try{
                var urlObj=new URL(urlStr);
                urlStr=urlObj.host+urlObj.pathname+urlObj.search+urlObj.hash;
            }catch(e){
            }

            url=<div className="user-tile-url">
                URL: <a href={this.props.url} rel="external" target="_blank">{urlStr}</a>
            </div>;
        }
        return (
            <div className={className}>
                <div className="user-tile-name">
                    {props.label}
                </div>
                <a className="user-tile-user" href={`/${props.screen_name}`}>
                    <UserIcon icon={props.icon} size={48} />
                    <div>{props.name}</div>
                </a>
                {url}
            </div>
        );
    }
});
