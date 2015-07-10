//Error message
var React = require("react");
module.exports = React.createClass({
    displayName:"ErrorMessage",
    render:function(){
        var err=this.props.children;
        if(err==null){
            return null;
        }
        return <p className="error-message">{err}</p>;
    }
});
