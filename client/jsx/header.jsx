var React=require('react');
var Reflux=require('reflux');

var userAction=require('../actions/user');
var errorStore=require('../stores/error');

var LoginForm=require('./commons/login-form.jsx');

var Header = React.createClass({
    displayName: "Header",
    propTypes:{
        session: React.PropTypes.object
    },
    getInitialState:function(){
        return {
            loginform: false
        };
    },
    handleLogout:function(e){
        e.preventDefault();
        userAction.logout();
    },
    handleLogin:function(e){
        e.preventDefault();
        this.setState({
            loginform: true
        });
    },
    render:function(){
        var session=this.props.session;
        return (<div className="root-header">
            <div className="root-header-topnavi">
                <a href="/">トップページ</a>
            </div>
            <div className="root-header-bar">
                <ul className="root-header-menu">
                    {
                        (session.loggedin===true ?
                         [
                            (<li key="my">
                                <a href="/my">
                                    <span className="icon icon-home"/>
                                    <span>マイページ</span>
                                </a>
                            </li>),
                            (<li key="plus">
                                <a href="/game/new">
                                    <span className="icon icon-masaoplus"/>
                                    <span>正男を投稿</span>
                                </a>
                            </li>),
                            (<li key="logout">
                                <a onClick={this.handleLogout}>ログアウト</a>
                            </li>)
                        ]
                            :
                                <li key="login">
                                    <a onClick={this.handleLogin}>ログイン</a>
                                </li>
                                )
                    }
                </ul>
            </div>
            <div className="root-header-session">
                {
                    session.loggedin===true ? this.loggedin() : this.notLoggedin()
                }
            </div>
            {
                (session.loggedin!==true && this.state.loginform===true ?
                    <div className="root-header-loginform">
                        <LoginForm />
                    </div>
                    : null)
            }
            <GlobalMessages />
        </div>);
    },
    loggedin:function(){
        var session=this.props.session;
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
        return <p className="header-logs-resetbutton" onClick={this.reset}>
            <span>×</span>
        </p>;
    }
});

