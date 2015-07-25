var React=require('react/addons');
var Reflux=require('reflux');

var userAction=require('../../actions/user');
var sessionStore=require('../../stores/session'),
    errorStore=require('../../stores/error');
var api=require('../../actions/api');

var ChangePasswordForm = require('../commons/changepassword-form.jsx'),
    NeedLogin = require('../commons/need-login.jsx'),
    Loading = require('../commons/loading.jsx');

var Account=React.createClass({
    displayName:"Account",
    mixins: [Reflux.listenTo(sessionStore,"onSessionChange")],
    getInitialState:function(){
        return {
            page: "profile",
            session: sessionStore.getInitialState()
        };
    },
    onSessionChange(session){
        if(session.loggedin===false){
            //ログアウトした
            this.setState({
                session: session,
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
                session: session,
                userdata: obj.data
            });
        })
        .catch(errorStore.emit);

    },
    componentDidMount(){
        this.loadUserdata(this.state.session);
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
                {this.state.session.loggedin===true ? this.content() : <NeedLogin/>}
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
            return <ChangePasswordForm/>;
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
        this.setState(this.makeStateFromProps(newProps));
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

