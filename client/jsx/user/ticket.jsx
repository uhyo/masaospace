var React=require('react');

var api=require('../../actions/api');

var errorStore=require('../../stores/error');

var Loading=require('../commons/loading.jsx');

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
                    state:"invalid",
                });
            }
        })
        .catch((err)=>{
            errorStore.emit(String(err));
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
            errorStore.emit(String(err));
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
            case "invalid":
                return this.invalid();
            default:
                return null;
        }
    },
    loading:function(){
        return <Loading/>;
    },
    complete:function(){
        return (
            <div>
                <p>登録を完了しました。</p>
                <p><a href="/">トップページに戻る</a></p>
                <p><a href="/my">マイページ</a></p>
            </div>
        );
    },
    invalid:function(){
        return (
            <div>
                <p>このURLは無効です。</p>
                <p>URLが発行されてから時間が経って無効となった可能性があります。もう一度最初からお試しください。</p>
            </div>
        );
    },
    form:function(){
        return (
            <form className="form" onSubmit={this.handleSubmit}>
                <p>ユーザー<b>{this.props.screen_name}</b>のパスワードを登録します。</p>
                <p>
                    <label className="form-row">
                        <span>パスワード</span>
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
        );
    },

});
module.exports = Ticket;
