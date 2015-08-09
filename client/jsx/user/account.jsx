var React=require('react/addons');
var Reflux=require('reflux');

var userAction=require('../../actions/user');
var errorStore=require('../../stores/error');
var api=require('../../actions/api');

var NeedLogin = require('../commons/need-login.jsx'),
    Loading = require('../commons/loading.jsx'),
    HorizontalMenu = require('../commons/horizontal-menu.jsx'),
    FileList = require('../file/file-list.jsx'),
    FileDataForm = require('../file/file-data-form.jsx'),
    UserIcon = require('../commons/user-icon.jsx');

var Account=React.createClass({
    displayName:"Account",
    mixins:[React.addons.LinkedStateMixin],
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
    render:function(){
        return (
            <section>
                <h1>アカウント設定</h1>
                {this.props.session.loggedin===true ? this.content() : <NeedLogin/>}
            </section>
        );
    },
    content:function(){
        var pages=[{
            id:"profile",
            name:"プロフィール"
        },{
            id:"password",
            name:"パスワード変更"
        },{
            id:"mail",
            name:"メールアドレス変更"
        },{
            id:"file",
            name:"ファイル管理"
        }];
        return (
            <div>
                <HorizontalMenu contents={pages} pageLink={this.linkState("page")} />
                {this.main()}
            </div>
        );
    },
    main(){
        var page=this.state.page;
        if(page==="profile"){
            //プロフィール
            return <ProfileForm config={this.props.config} userdata={this.state.userdata}/>;
        }else if(page==="password"){
            return <ChangePasswordForm config={this.props.config}/>;
        }else if(page==="mail"){
            return <MailForm userdata={this.state.userdata}/>;
        }else if(page==="file"){
            return <FilePage config={this.props.config} session={this.props.session}/>;
        }
        return null;
    }
});

//サブコンテンツ
var ProfileForm=React.createClass({
    displayName:"ProfileForm",
    propTypes:{
        config: React.PropTypes.object.isRequired,
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
            icon: userdata.icon || null,
            url: userdata.url || "",
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
        if(n==="name" || n==="profile" || n==="url"){
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
            profile: this.state.profile,
            icon: this.state.icon,
            url: this.state.url
        });
    },
    handleIconChange(file){
        this.setState({
            icon: file ? file.id : null,
            modified: true
        });
    },
    render(){
        if(this.props.userdata==null){
            return <Loading/>;
        }
        var iconLink={
            value: this.state.icon,
            requestChange: this.handleIconChange
        };
        return (<div>
            <IconEdit config={this.props.config} userdata={this.props.userdata} iconLink={iconLink}/>
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
                        <span>ウェブサイトのURL</span>
                        <input type="url" name="url" value={this.state.url} onChange={this.handleChange} />
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
        </div>
        );
    }
});
var IconEdit = React.createClass({
    displayName: "IconEdit",
    propTypes:{
        config: React.PropTypes.object.isRequired,
        userdata: React.PropTypes.object.isRequired,
        iconLink: React.PropTypes.shape({
            value: React.PropTypes.oneOfType([
                React.PropTypes.string,
                React.PropTypes.object
            ]),
            requestChange: React.PropTypes.func
        }).isRequired
    },
    getInitialState(){
        return {
            edit: false
        };
    },
    render(){
        var filelist=null;
        if(this.state.edit===true){
            var query={
                owner: this.props.userdata.id,
                usage: "other"
            };
            filelist = <FileList config={this.props.config} query={query} fileLink={this.props.iconLink} useDefault usePreviewLink/>;
        }
        var icon=this.props.iconLink.value;
        //ファイルIDをとりだす
        if(icon && icon.id){
            icon=icon.id;
        }
        return <div className="user-account-profile-icon-wrapper">
            <div className="user-account-profile-icon-menu">
                <div className="user-account-profile-icon-preview" onClick={this.handleIconEdit}>
                    <UserIcon icon={icon} size={128} />
                </div>
                <div>
                    <p>アイコンは最大128×128で表示されることがあります。</p>
                    {icon ? null : <p>アイコンが設定されていません。</p>}
                    {this.state.edit ? <p>アイコンを変更したら、下の保存ボタンを押してください。</p> : null}
                </div>
            </div>
            {filelist}
        </div>;
    },
    handleIconEdit(e){
        this.setState({
            edit: true
        });
    },
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

var FilePage=React.createClass({
    displayName:"FilePage",
    mixins:[React.addons.LinkedStateMixin],
    propTypes:{
        session: React.PropTypes.object.isRequired,
        config: React.PropTypes.object.isRequired
    },
    getInitialState(){
        return {
            saving: false,
            load: false,
            //選択されたファイル
            file:null
        };
    },
    render(){
        var query={
            owner: this.props.session.user
        };
        return <div>
            <FileList config={this.props.config} query={query} forceLoad={this.state.load} diskSpace fileLink={this.linkState("file")}/>
            {this.form()}
        </div>;
    },
    form(){
        var file=this.state.file;
        if(file==null){
            //ファイルが選択されていなかったらなにも表示しない
            return null;
        }
       var fileData={
            type: file.type,
            name: file.name,
            usage: file.usage,
            description: file.description
        };
        var submit,disabled;
        if(this.state.saving===true){
            submit="保存中……";
            disabled=true;
        }else{
            submit="保存";
            disabled=false;
        }
        var fileurl="/uploaded/"+file.id;
        return <FileDataForm config={this.props.config} submitButton={submit} submitDisabled={disabled} previewURL={fileurl} previewLink={fileurl} defaultFile={fileData} onSubmit={this.handleSubmit} />;
    },
    handleSubmit(file){
        //ファイルのメタデータを編集するぞーーーーーーーーーーーーーーー
        var filedata={
            id: this.state.file.id,
            name: file.name,
            type: file.type,
            usage: file.usage,
            description: file.description
        };
        api("/api/file/edit",filedata)
        .then(()=>{
            this.setState({
                saving: false,
                load: true
            });
        })
        .catch(errorStore.emit);
        this.setState({
            saving: true,
            load: false,
            file: filedata
        });
    }
});

module.exports = Account;

