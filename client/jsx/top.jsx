var React=require('react');
var Reflux=require('reflux');

var sessionStore=require('../stores/session');

var LoginForm=require('./commons/login-form.jsx');


module.exports = React.createClass({
    displayName:"Top",
    mixins:[Reflux.connect(sessionStore,"session")],
    render(){
        return (
            <section>
                <h1>{this.props.title}</h1>
                {this.loginForm()}
            </section>);
    },
    loginForm(){
        if(this.state.session.loggedin){
            //ログイン済
            return null;
        }else{
            return <LoginForm />;
        }
    }
});
