var React=require('react/addons');

var api=require('../../actions/api');

var errorStore=require('../../stores/error');

var Loading=require('../commons/loading.jsx');

var Ticket = React.createClass({
    displayName:"Ticket",
    propTypes:{
        ticket: React.PropTypes.string.isRequired,
        screen_name: React.PropTypes.string,
        config: React.PropTypes.object
    },
    getInitialState:function(){
        return {
            state: "loading",

            password: "",
            password2: ""
        };
    },
    componentDidMount:function(){
        api("/api/user/ticket/check",{
            token: this.props.ticket
        })
        .then((obj)=>{
            if(obj.ticket===true){
                //チケットがあった
                //チケットタイプによる分岐
                if(obj.type==="setpassword"){
                    //パスワードを設定
                    this.setState({
                        state:"form",
                        type: "setpassword"
                    });
                }else if(obj.type==="setmail"){
                    //メールアドレスを設定
                    this.setState({
                        state: "form",
                        type: "setmail"
                    });
                }else if(obj.type==="resetpassword"){
                    //パスワード再発行
                    this.setState({
                        state: "form",
                        type: "resetpassword"
                    });
                }else{
                    //分からない
                    this.setState({
                        state:"invalid",
                    });
                }
            }else{
                //なかった
                this.setState({
                    state:"invalid",
                });
            }
        })
        .catch(errorStore.emit);
    },
    /* rendering */
    render:function(){
        if(this.state.state==="loading"){
            return <Loading/>;
        }
        if(this.state.state==="invalid"){
            return (
                <div className="information">
                    <p>このURLは無効です。</p>
                    <p>URLが発行されてから時間が経って無効となった可能性があります。もう一度最初からお試しください。</p>
                </div>
            );
        }
        //formだろう
        if(this.state.type==="setpassword"){
            return (
                <section>
                    <h1>パスワード設定</h1>
                    <SetPassword screen_name={this.props.screen_name} ticket={this.props.ticket} config={this.props.config}/>
                </section>);
        }else if(this.state.type==="setmail"){
            return (
                <section>
                    <h1>メールアドレス変更</h1>
                    <Resolve ticket={this.props.ticket}>
                        <p>メールアドレスの変更を完了しました。</p>
                    </Resolve>
                </section>);
        }else if(this.state.type==="resetpassword"){
            return (
                <section>
                    <h1>パスワード再発行</h1>
                    <ResetPassword ticket={this.props.ticket}/>
                </section>
            );
        }
    },
});

//パスワード変更フォーム
var SetPassword = React.createClass({
    displayName:"SetPassword",
    propTypes:{
        screen_name: React.PropTypes.string,
        ticket: React.PropTypes.string,
        config: React.PropTypes.object,
    },
    getInitialState:function(){
        return {
            end:false,
            password: "",
            password2: ""
        };
    },
    handleChange: function(e){
        var name=e.target.name;
        if(name==="password" || name==="password2"){
            this.setState({
                [name]: e.target.value
            },()=>{
                if(name==="password"){
                    //長さチェーック
                    var t=React.findDOMNode(this.refs.password);
                    if(this.state.password && (this.state.password.length < this.props.config.user.password.minLength)){
                        //長さがたりない
                        if(t.validity.tooShort!==true){
                            //自分でアレする
                            t.setCustomValidity("パスワードが短すぎます。最低"+this.props.config.user.password.minLength+"文字入力してください。");
                        }
                    }else{
                        t.setCustomValidity("");
                    }
                }
                if(this.state.password!==this.state.password2){
                    React.findDOMNode(this.refs.password2).setCustomValidity("パスワードが一致しません。");
                }else{
                    React.findDOMNode(this.refs.password2).setCustomValidity("");
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
                end:true
            });
        })
        .catch(function(err){
            errorStore.emit(String(err));
        });
    },
    render(){
        var config=this.props.config.user;
        if(this.state.end===true){
            return (
                <div>
                    <p>ユーザー登録を完了しました。</p>
                    <p>さっそく上のメニューからログインしてみましょう。</p>
                </div>
            );
        }
        return (
            <form className="form" onSubmit={this.handleSubmit}>
                <p>ユーザー<b>{this.props.screen_name}</b>のパスワードを登録します。</p>
                <p>
                    <label className="form-row">
                        <span>パスワード</span>
                        <input type="password" name="password" ref="password" minLength={config.password.minLength} maxLength={config.password.maxLength} onChange={this.handleChange} />
                    </label>
                </p>
                <p>
                    <label className="form-row">
                        <span>再入力</span>
                        <input type="password" name="password2" ref="password2" minLength={config.password.minLength} maxLength={config.password.maxLength} onChange={this.handleChange} />
                    </label>
                </p>
                <p><input className="form-single form-button" type="submit" value="送信" /></p>
            </form>
        );
    },

});

//パスワード再発行
var ResetPassword = React.createClass({
    displayName:"ResetPassword",
    mixins:[React.addons.LinkedStateMixin],
    propTypes:{
        ticket: React.PropTypes.string.isRequired
    },
    getInitialState(){
        return {
            end: false,
            show_password: false,
            screen_name: "",
            newpassword: ""
        };
    },
    componentDidMount(){
        api("/api/user/ticket/resolve",{
            token: this.props.ticket
        })
        .then((obj)=>{
            this.setState({
                end: true,
                screen_name: obj.result.screen_name,
                newpassword: obj.result.newpassword
            });
        })
        .catch(errorStore.emit);
    },
    render(){
        if(this.state.end===false){
            return <Loading/>;
        }
        var password;
        if(this.state.show_password){
            password = <p>ユーザーIDは<b>{this.state.screen_name}</b>, 新しいパスワードは<b>{this.state.newpassword}</b>です。</p>;
        }else{
            password = null;
        }
        return <div>
            <p>パスワードの再発行が完了しました。下のチェックボックスをチェックすると新しいパスワードが表示されます。</p>
            <p>ログイン後、新しくパスワードを設定しなおすことをおすすめします。</p>
            <p>パスワードを表示： <input type="checkbox" checkedLink={this.linkState("show_password")} /></p>
            {password}
        </div>;
    }
});

//一般のチケットをアレする
var Resolve = React.createClass({
    displayName:"Resolve",
    propTypes:{
        ticket: React.PropTypes.string.isRequired
    },
    getInitialState(){
        return {
            end: false
        };
    },
    componentDidMount(){
        api("/api/user/ticket/resolve",{
            token: this.props.ticket
        }).then(()=>{
            this.setState({
                end: true
            });
        })
        .catch((e)=>{
            errorStore.emit(e);
        });
    },
    render(){
        if(this.state.end===false){
            return <Loading/>;
        }
        return <div>{this.props.children}</div>;
    }
});
module.exports = Ticket;
