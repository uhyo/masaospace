var React=require('react');
var Reflux=require('reflux');

var api=require('../../actions/api');


module.exports = React.createClass({
    displayName: "ChangePasswordForm",
    getInitialState:function(){
        return {
            form: true,

            errorMessage:null,
            password: "",
            password2: ""
        };
    },
    handleChange: function(e){
        var name=e.target.name;
        if(name==="password" || name==="password2"){
            var obj={};
            obj[name]=e.target.value;
            this.setState(obj,()=>{
                if(this.state.password!==this.state.password2){
                    React.findDOMNode(this).getElementsByTagName("form")[0].elements["password2"].setCustomValidity("パスワードが一致しません。");
                }else{
                    React.findDOMNode(this).getElementsByTagName("form")[0].elements["password2"].setCustomValidity("");
                }
            });
        }
    },
    handleSubmit: function(e){
        e.preventDefault();
        var t=this;
        //login request
        api("/api/user/changepassword",{
            password: this.state.password
        })
        .then(function(obj){
            t.setState({
                form:false
            });
        })
        .catch(function(e){
            t.setState({
                error:String(e)
            });
        });
    },
    render: function(){
        if(this.state.form){
            return (
                <section className="changepassword-form">
                    <h1>パスワード変更</h1>
                    {this.state.error!=null ?
                        <p className="error-message">{this.state.error}</p> : null}
                    <form className="form" onSubmit={this.handleSubmit}>
                        <p>
                            <label className="form-row">
                                <span>新しいパスワード</span>
                                <input type="password" name="password" onChange={this.handleChange} />
                            </label>
                        </p>
                        <p>
                            <label className="form-row">
                                <span>再入力</span>
                                <input type="password" name="password2" onChange={this.handleChange} />
                            </label>
                        </p>
                        <p><input className="form-single form-button" type="submit" value="送信" /></p>
                    </form>
                </section>
            );
        }else{
            return (
                <section className="changepassword-form">
                    <h1>パスワード変更</h1>
                    <p>パスワードを変更しました。</p>
                </section>);
        }
    }
});

