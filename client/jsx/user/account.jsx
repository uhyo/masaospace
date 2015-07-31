var React=require('react/addons');
var Reflux=require('reflux');

var userAction=require('../../actions/user');
var errorStore=require('../../stores/error');
var api=require('../../actions/api');

var NeedLogin = require('../commons/need-login.jsx'),
    Loading = require('../commons/loading.jsx');

var Account=React.createClass({
    displayName:"Account",
    propTypes:{
        config: React.PropTypes.object.isRequired,
        session: React.PropTypes.object.isRequired
    },
    getInitialState:function(){
        return {
            page: "profile",
            userdata: null
        };
    },
    componentDidMount(){
        this.loadUserdata(this.props.session);
    },
    componentWillReceiveProps(nextProps){
        if(this.props.session!==nextProps.session){
            this.onSessionChange(nextProps.session);
        }
    },
    onSessionChange(session){
        if(session.loggedin===false){
            //ログアウトした
            this.setState({
                userdata: null
            });
        }else{
            this.loadUserdata(session);
        }
    },

    loadUserdata(session){
        api("/api/user/mydata")
        .then((obj)=>{
            this.setState({
                userdata: obj.data
            });
        })
        .catch(errorStore.emit);

    },
    handleClick:function(e){
        var t=e.target;
        var n=t.dataset.menu;
        this.setState({
            page: n
        });
    },
    render:function(){
        return (
            <section>
                <h1>アカウント設定</h1>
                {this.props.session.loggedin===true ? this.content() : <NeedLogin/>}
            </section>
        );
    },
    content:function(){
        return (
            <div>
                {this.menu()}
                {this.main()}
            </div>
        );
    },
    menu(){
        var pages=[["profile","プロフィール"],["password","パスワード変更"],["mail","メールアドレス変更"]];
        var current=this.state.page;
        return (
            <ul className="user-account-menu">{
                pages.map(([pageid,pagename])=>{
                    var className = current===pageid ? "user-account-menu-current" : null;
                    return <li key={pageid} className={className} onClick={this.handleClick} data-menu={pageid}>{pagename}</li>;
                })
            }</ul>
        );
    },
    main(){
        var page=this.state.page;
        if(page==="profile"){
            //プロフィール
            return <ProfileForm userdata={this.state.userdata}/>;
        }else if(page==="password"){
            return <ChangePasswordForm config={this.props.config}/>;
        }else if(page==="mail"){
            return <MailForm userdata={this.state.userdata}/>;
        }
        return null;
    }
});

//サブコンテンツ
var ProfileForm=React.createClass({
    displayName:"ProfileForm",
    propTypes:{
        userdata: React.PropTypes.object
    },
    getInitialState:function(){
        return this.makeStateFromProps(this.props);
    },
    makeStateFromProps:function(props){
        var userdata=props.userdata || {};
        return {
            //user data form
            name: userdata.name || "",
            profile: userdata.profile || "",
            //modified flag
            modified: false,
        };
    },
    componentWillReceiveProps(newProps){
        if(this.props.userdata !== newProps.userdata){
            this.setState(this.makeStateFromProps(newProps));
        }
    },
    handleChange:function(e){
        var n=e.target.name;
        if(n==="name" || n==="profile"){
            this.setState({
                [n]: e.target.value,
                modified: true
            });
        }
    },
    handleSubmit:function(e){
        e.preventDefault();
        userAction.update({
            name: this.state.name,
            profile: this.state.profile
        });
    },
    render(){
        if(this.props.userdata==null){
            return <Loading/>;
        }
        return (
            <form className="form" onSubmit={this.handleSubmit}>
                <p>
                    <label className="form-row">
                        <span>ユーザーID</span>
                        <input type="text" readOnly value={this.props.userdata.screen_name} />
                    </label>
                </p>
                <p>
                    <label className="form-row">
                        <span>メールアドレス</span>
                        <input type="email" readOnly value={this.props.userdata.mail} />
                    </label>
                </p>
                <p>
                    <label className="form-row">
                        <span>ユーザー名</span>
                        <input type="text" name="name" value={this.state.name} onChange={this.handleChange} />
                    </label>
                </p>
                <p>
                    <label className="form-row">
                        <span>プロフィール</span>
                        <textarea name="profile" value={this.state.profile} onChange={this.handleChange} />
                    </label>
                </p>
                <p><input className="form-single form-button" type="submit" value={"変更を保存"+ (this.state.modified ? " …" : "")} /></p>
            </form>
        );
    }
});

var ChangePasswordForm = React.createClass({
    displayName: "ChangePasswordForm",
    propTypes:{
        config: React.PropTypes.object
    },
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
                if(name==="current" || name==="password"){
                    //長さチェック(TODO: まとめる)
                    var t=React.findDOMNode(this.refs[name]);
                    if(this.state[name] && (this.state[name].length < this.props.config.user.password.minLength)){
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
        var config=this.props.config.user;

        if(this.state.form){
            return (
                <section>
                    <h1>パスワード変更</h1>
                    <div className="user-changepassword-form-wrapper">
                        <form className="form" onSubmit={this.handleSubmit}>
                            <p>
                                <label className="form-row">
                                    <span>現在のパスワード</span>
                                    <input type="password" name="current" ref="current" minLength={config.password.minLength} maxLength={config.password.maxLength} required onChange={this.handleChange} />
                                </label>
                            </p>
                            <p>
                                <label className="form-row">
                                    <span>新しいパスワード</span>
                                    <input type="password" name="password" ref="password" minLength={config.password.minLength} maxLength={config.password.maxLength} required onChange={this.handleChange} />
                                </label>
                            </p>
                            <p>
                                <label className="form-row">
                                    <span>再入力</span>
                                    <input type="password" name="password2" ref="password2" minLength={config.password.minLength} maxLength={config.password.maxLength} required onChange={this.handleChange} />
                                </label>
                            </p>
                            <p><input className="form-single form-button" type="submit" value="送信" /></p>
                        </form>
                    </div>
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

var MailForm=React.createClass({
    displayName:"MailForm",
    mixins:[React.addons.LinkedStateMixin],
    getInitialState(){
        return {
            end: false,
            mail:""
        };
    },
    propTypes:{
        userdata: React.PropTypes.object
    },
    handleSubmit(e){
        e.preventDefault();
        api("/api/user/changemail",{
            mail: this.state.mail
        })
        .then((obj)=>{
            this.setState({
                end: true
            });
        })
        .catch(errorStore.emit);
    },
    render(){
        if(this.state.end===true){
            return (
                <div>
                    <p>メールを<b>{this.state.mail}</b>に送信しました。</p>
                    <p>メールに記載されたリンクから変更手続を行なってください。</p>
                </div>
            );
        }
        return (
            <div>
                <p>新しいメールアドレスを入力してください。確認用のメールが送信されます。</p>
                <form className="form" onSubmit={this.handleSubmit}>
                    <p>
                        <label className="form-row">
                            <span>メールアドレス</span>
                            <input type="email" name="mail" required valueLink={this.linkState("mail")}/>
                        </label>
                    </p>
                    <p><input className="form-single form-button" type="submit" value="送信" /></p>
                </form>
            </div>
        );
    }
});

module.exports = Account;

