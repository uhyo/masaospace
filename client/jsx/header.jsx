var React=require('react');
var Reflux=require('reflux');

var userAction=require('../actions/user');
var sessionStore=require('../stores/session'),
    errorStore=require('../stores/error');

var Header = React.createClass({
    displayName: "Header",
    mixins: [Reflux.connect(sessionStore,"session")],
    onClick:function(e){
        e.preventDefault();
        userAction.logout();
    },
    render:function(){
        var session=this.state.session;
        return (<div className="root-header">
            <div className="root-header-bar">
                <ul className="root-header-menu">
                    {
                        (session.loggedin===true ?
                            <li><a href="/my">マイページ</a></li>
                        :
                            <li>ログイン？</li>)
                    }
                </ul>
            </div>
            <div className="root-header-session">
                {
                    session.loggedin===true ? this.loggedin() : this.notLoggedin()
                }
            </div>
            <GlobalMessages />
        </div>);
    },
    loggedin:function(){
        var session=this.state.session;
        return (
            <p>{session.name} さん</p>
        );
    },
    notLoggedin:function(){
        return null;
    }
});

module.exports = Header;

//エラーメッセージを集約
var GlobalMessages = React.createClass({
    displayName: "GlobalMessages",
    mixins:[Reflux.connect(errorStore)],
    getInitialState(){
        return {
            logs: []
        };
    },
    reset(){
        errorStore.reset();
    },
    render(){
        var logs=this.state.logs;
        return (
            <div className="header-logs">
                {this.resetButton()}
                <div>{
                    logs.map((log,i)=>{
                        return <p key={i}>{log}</p>;
                    })
                }</div>
            </div>
        );
    },
    resetButton(){
        if(this.state.logs.length===0){
            return null;
        }
        return <p onClick={this.reset}>×</p>;
    }
});

