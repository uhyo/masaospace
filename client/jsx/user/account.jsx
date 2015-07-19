var React=require('react');
var Reflux=require('reflux');

var userAction=require('../../actions/user');
var sessionStore=require('../../stores/session');
var api=require('../../actions/api');

var ChangePasswordForm = require('../commons/changepassword-form.jsx');

var Account=React.createClass({
    displayName:"Account",
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
            changePassword: false,
            //user data form
            name: session ? session.name : ""
        };
    },
    handleChange:function(e){
        if(e.target.name==="name"){
            this.setState({
                name: e.target.value
            });
        }
    },
    handleSubmit:function(e){
        e.preventDefault();
        console.log(this.state.name);
        userAction.update({
            name: this.state.name
        });
    },
    openChangePassword:function(e){
        this.setState({
            changePassword:true
        });
    },
    render:function(){
        return (
            <section>
                <h1>アカウント設定</h1>
                {this.state.session.loggedin===true ? this.content() : null}
            </section>
        );
    },
    content:function(){
        var session=this.state.session;
        return (
            <div>
                <form onSubmit={this.handleSubmit}>
                    <p>ユーザーID: {session.screen_name}</p>
                    <p>ユーザー名: <input type="text" name="name" value={this.state.name} onChange={this.handleChange} /></p>
                    <p><input type="submit" value="変更を保存" /></p>
                </form>
                <hr/>
                {!this.state.changePassword ? 
                    (<p>
                        <input type="button" value="パスワードを変更" onClick={this.openChangePassword} />
                    </p>) :
                        (<ChangePasswordForm/>)
                }
            </div>
        );
    },
});

module.exports = Account;

