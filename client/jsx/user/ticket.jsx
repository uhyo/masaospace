var React=require('react');

var api=require('../../actions/api');


var Ticket = React.createClass({
    displayName:"Ticket",
    getInitialState:function(){
        return {
            state: "loading",

            errorMessage:null,
            password: "",
            password2: ""
        };
    },
    componentDidMount:function(){
        api("/api/user/entry/check",{
            token: this.props.ticket
        })
        .then((obj)=>{
            if(obj.ticket===true){
                //チケットがあった
                this.setState({
                    state:"form"
                });
            }else{
                //なかった
                this.setState({
                    state:"error",
                    errorMessage: "このURLは無効です。"
                });
            }
        })
        .catch((err)=>{
            this.setState({
                state:"error",
                errorMessage: err
            });
        });
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
        api("/api/user/entry/setpassword",{
            token: this.props.ticket,
            screen_name: this.props.screen_name,
            password: this.state.password
        })
        .then(function(obj){
            t.setState({
                state: "complete"
            });
        })
        .catch(function(err){
            t.setState({
                state: "error",
                errorMessage: String(err)
            });
        });
    },
    /* rendering */
    render:function(){
        return (
            <section>
                <h1>パスワード設定</h1>
                {this.getPage()}
            </section>);
    },
    getPage:function(){
        switch(this.state.state){
            case "loading":
                return this.loading();
            case "form":
                return this.form();
            case "complete":
                return this.complete();
            default:
                return this.errorPage();
        }
    },
    loading:function(){
        return (
            <p>ロード中です。しばらくお待ちください。</p>
        );
    },
    complete:function(){
        return (
            <p>登録を完了しました。TODO</p>
        );
    },
    errorPage:function(){
        return (
            <p>エラー：{this.state.errorMessage}</p>
        );
    },
    form:function(){
        return (
            <form onSubmit={this.handleSubmit}>
                <p>ユーザー<b>{this.props.screen_name}</b>のパスワードを登録します。</p>
                <p>パスワード：<input type="password" name="password" onChange={this.handleChange} /></p>
                <p>再入力：<input type="password" name="password2" onChange={this.handleChange} /></p>
                <p><input type="submit" value="送信" /></p>
            </form>
        );
    },

});
module.exports = Ticket;
