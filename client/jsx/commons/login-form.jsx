var React=require('react');

var userActions=require('../../actions/user');

//Login Form

module.exports = React.createClass({
    getInitialState:function(){
        return {
            id:"",
            password:""
        };
    },
    handleChange: function(e){
        if(e.target.name==="id"){
            this.setState({
                id: e.target.value
            });
        }else if(e.target.name==="password"){
            this.setState({
                password: e.target.value
            });
        }
    },
    handleSubmit: function(e){
        e.preventDefault();
        //login request
        userActions.login({
            userid: this.state.id,
            password: this.state.password
        });
    },
    render: function(){
        return (
            <form onSubmit={this.handleSubmit}>
                <p>User ID: <input name="id" onChange={this.handleChange} value={this.state.id} /></p>
                <p>Password: <input name="password" type="password" onChange={this.handleChange} value={this.state.password} /></p>
                <p><input type="submit" value="ログイン" /></p>
            </form>);
    }
});
