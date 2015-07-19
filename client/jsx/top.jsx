var React=require('react');
var Reflux=require('reflux');

var sessionStore=require('../stores/session');
var pageActions=require('../actions/page');

var LoginForm=require('./commons/login-form.jsx'),
    Loading=require('./commons/loading.jsx');


module.exports = React.createClass({
    displayName:"Top",
    mixins:[Reflux.connect(sessionStore,"session")],
    componentDidMount:function(){
        if(this.state.session.loggedin){
            this.gotoMyPage();
        }
    },
    componentDidUpdate(){
        if(this.state.session.loggedin){
            this.gotoMyPage();
        }
    },
    gotoMyPage(){
        pageActions.load("/my");
    },
    render(){
        if(this.state.session.loggedin){
            return <div>
                <Loading />
            </div>;
        }

        return (
            <section>
                <h1>{this.props.title}</h1>
                <LoginForm />
            </section>);
    }
});
