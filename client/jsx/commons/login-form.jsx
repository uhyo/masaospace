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
            <section className="login-form">
                <h1>ログイン</h1>
                <form className="form" onSubmit={this.handleSubmit}>
                    <p>
                        <label className="form-row">
                            <span>ユーザーID</span>
                            <input name="id" onChange={this.handleChange} value={this.state.id} />
                        </label>
                    </p>
                    <p>
                        <label className="form-row">
                            <span>パスワード</span>
                            <input name="password" type="password" onChange={this.handleChange} value={this.state.password} />
                        </label>
                    </p>
                    <p><input className="form-single form-button" type="submit" value="ログイン" /></p>
                </form>
                <p>アカウントをお持ちでない方は<a href="/entry/page">新規登録</a></p>
            </section>);
    }
});
