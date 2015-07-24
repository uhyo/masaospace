var React=require('react');
var Reflux=require('reflux');

var api=require('../../actions/api');

var errorStore=require('../../stores/error');


module.exports = React.createClass({
    displayName: "ChangePasswordForm",
    getInitialState:function(){
        return {
            form: true,

            current:"",
            password: "",
            password2: ""
        };
    },
    handleChange: function(e){
        var name=e.target.name;
        if(name==="current" || name==="password" || name==="password2"){
            this.setState({
                [name]:e.target.value
            },()=>{
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
            oldpassword: this.state.current,
            newpassword: this.state.password
        })
        .then(function(obj){
            t.setState({
                form:false
            });
        })
        .catch(function(e){
            errorStore.emit(String(e));
        });
    },
    render: function(){
        if(this.state.form){
            return (
                <section className="changepassword-form">
                    <h1>パスワード変更</h1>
                    <form className="form" onSubmit={this.handleSubmit}>
                        <p>
                            <label className="form-row">
                                <span>現在のパスワード</span>
                                <input type="password" name="current" onChange={this.handleChange} />
                            </label>
                        </p>
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

