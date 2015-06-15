var React=require('react');
var Reflux=require('reflux');

var sessionStore=require('../stores/session');

var Header = React.createClass({
    mixins: [Reflux.connect(sessionStore,"session")],
    render:function(){
        var session=this.state.session;
        return (<div className="root-header">
            {
                session.loggedin===true ? session.name+" ("+session.screen_name+")" : "未ログイン"
            }
        </div>);
    }
});

module.exports = Header;

