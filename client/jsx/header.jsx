var React=require('react');
var Reflux=require('reflux');

var userAction=require('../actions/user');
var sessionStore=require('../stores/session');

var Header = React.createClass({
    mixins: [Reflux.connect(sessionStore,"session")],
    onClick:function(e){
        e.preventDefault();
        userAction.logout();
    },
    render:function(){
        var session=this.state.session;
        return (<div className="root-header">
            {
                session.loggedin===true ? this.loggedin() : this.notLoggedin()
            }
        </div>);
    },
    loggedin:function(){
        var session=this.state.session;
        return (
            <div>
                <p>{session.name} ({session.screen_name})</p>
                <p><a href="" onClick={this.onClick}>ログアウト</a></p>
            </div>
               );
    },
    notLoggedin:function(){
        return (
            <div>
                <p>未ログイン</p>
            </div>
        );
    }
});

module.exports = Header;

