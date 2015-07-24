var React=require('react');
var Reflux=require('reflux');

var userAction=require('../../actions/user');
var sessionStore=require('../../stores/session');
var api=require('../../actions/api');

var ChangePasswordForm = require('../commons/changepassword-form.jsx'),
    NeedLogin = require('../commons/need-login.jsx');

var Account=React.createClass({
    displayName:"Account",
    mixins: [Reflux.connect(sessionStore,"session")],
    getInitialState:function(){
        return {
            page: "profile"
        };
    },
    handleClick:function(e){
        var t=e.target;
        var n=t.dataset.menu;
        this.setState({
            page: n
        });
    },
    render:function(){
        return (
            <section>
                <h1>アカウント設定</h1>
                {this.state.session.loggedin===true ? this.content() : <NeedLogin/>}
            </section>
        );
    },
    content:function(){
        return (
            <div>
                {this.menu()}
                {this.main()}
            </div>
        );
    },
    menu(){
        var pages=[["profile","プロフィール"],["password","パスワード変更"]];
        var current=this.state.page;
        return (
            <ul className="user-account-menu">{
                pages.map(([pageid,pagename])=>{
                    var className = current===pageid ? "user-account-menu-current" : null;
                    return <li key={pageid} className={className} onClick={this.handleClick} data-menu={pageid}>{pagename}</li>;
                })
            }</ul>
        );
    },
    main(){
        var page=this.state.page;
        if(page==="profile"){
            //プロフィール
            return <ProfileForm/>;
        }else if(page==="password"){
            return <ChangePasswordForm/>;
        }
        return null;
    }
});

//サブコンテンツ
var ProfileForm=React.createClass({
    displayName:"ProfileForm",
    mixins: [Reflux.listenTo(sessionStore,"onSessionChange")],
    getInitialState:function(){
        return this.makeStateFromSession(sessionStore.getInitialState());
    },
    onSessionChange:function(session){
        this.setState(this.makeStateFromSession(session));
    },
    makeStateFromSession:function(session){
        return {
            session: session,
            //user data form
            name: session ? session.name : "",
            profile: session ? session.profile : "",
            //modified flag
            modified: false,
        };
    },
    handleChange:function(e){
        var n=e.target.name;
        if(n==="name" || n==="profile"){
            this.setState({
                [n]: e.target.value,
                modified: true
            });
        }
    },
    handleSubmit:function(e){
        e.preventDefault();
        userAction.update({
            name: this.state.name,
            profile: this.state.profile
        });
    },
    render(){
        var session=this.state.session;
        return (
            <form className="form" onSubmit={this.handleSubmit}>
                <p>
                    <label className="form-row">
                        <span>ユーザーID</span>
                        <input type="text" readOnly value={session.screen_name} />
                    </label>
                </p>
                <p>
                    <label className="form-row">
                        <span>ユーザー名</span>
                        <input type="text" name="name" value={this.state.name} onChange={this.handleChange} />
                    </label>
                </p>
                <p>
                    <label className="form-row">
                        <span>プロフィール</span>
                        <textarea name="profile" value={this.state.profile} onChange={this.handleChange} />
                    </label>
                </p>
                <p><input className="form-single form-button" type="submit" value={"変更を保存"+ (this.state.modified ? " …" : "")} /></p>
            </form>
        );
    }
});

module.exports = Account;

