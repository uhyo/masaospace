var React=require('react');

var LoginForm=require('./commons/login-form.jsx');

class Top extends React.Component{
    render(){
        return (
            <section>
                <h1>{this.props.title}</h1>
                <LoginForm />
            </section>);
    }
}

module.exports = Top;
