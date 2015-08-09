var React=require('react');

module.exports = React.createClass({
    displayname:"UserIcon",
    propTypes:{
        //アイコンのID
        icon: React.PropTypes.string,
        size: React.PropTypes.number.isRequired
    },
    render(){
        var src, size;
        size=this.props.size;
        if(this.props.icon){
            src="/uploaded/"+this.props.icon;
        }else{
            src="/static/images/no-icon.png";
        }
        return <div className="user-icon">
            <img src={src} width={size} height={size} />
        </div>;
    }
});
