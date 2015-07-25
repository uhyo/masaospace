var React=require('react');

var api=require('../../actions/api');

var errorStore=require('../../stores/error');

var Loading=require('../commons/loading.jsx');

var Ticket = React.createClass({
    displayName:"Ticket",
    propTypes:{
        ticket: React.PropTypes.string.isRequired,
        screen_name: React.PropTypes.string
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
        .catch((err)=>{
            errorStore.emit(String(err));
        });
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
                    <SetPassword ticket={this.props.ticket} />
                </section>);
        }else if(this.state.type==="setmail"){
            return (
                <section>
                    <h1>メールアドレス変更</h1>
                    <Resolve ticket={this.props.ticket}>
                        <p>メールアドレスの変更を完了しました。</p>
                    </Resolve>
                </section>);
        }
    },
});

//パスワード変更フォーム
var SetPassword = React.createClass({
    displayName:"SetPassword",
    propTypes:{
        ticket: React.PropTypes.string
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
                if(this.state.password!==this.state.password2){
                    React.findDOMNode(this.refs.password).setCustomValidity("パスワードが一致しません。");
                }else{
                    React.findDOMNode(this.refs.password).setCustomValidity("");
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
        if(this.state.end===true){
            return (
                <div>
                    <p>ユーザー登録を完了しました。</p>
                </div>
            );
        }
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
                        <input type="password" name="password2" ref="password" onChange={this.handleChange} />
                    </label>
                </p>
                <p><input className="form-single form-button" type="submit" value="送信" /></p>
            </form>
        );
    },

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
