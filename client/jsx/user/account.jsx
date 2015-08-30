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
        },{
            id:"series",
            name:"シリーズ管理"
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
        }else if(page==="series"){
            return <SeriesPage config={this.props.config} session={this.props.session}/>;
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
                    {this.state.edit ? <p>アイコンを変更したら、下の保存ボタンを押してください。</p> : <p>アイコンをクリックして変更できます。</p>}
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
    propTypes:{
        session: React.PropTypes.object.isRequired,
        config: React.PropTypes.object.isRequired
    },
    getInitialState(){
        return {
            saving: false,
            load: false,
            //選択されたファイル
            file:null,
            //モード
            mode: null,
        };
    },
    render(){
        var query={
            owner: this.props.session.user
        };
        return <div>
            <FileList config={this.props.config} query={query} forceLoad={this.state.load} diskSpace fileLink={this.fileLink()}/>
            {this.form()}
        </div>;
    },
    form(){
        var file=this.state.file, mode=this.state.mode;
        if(file==null){
            //ファイルが選択されていなかったらなにも表示しない
            return null;
        }
        var menu = <div className="icon-menu">{
            ["edit","del"].map((md)=>{
                var selected = md===mode ? " icon-menu-current" : "";
                return <div key={md} className={"icon-menu-item"+selected} onClick={this.handleMenu(md)}>
                    <span className={"icon icon-file"+md}/>
                </div>;
            })
        }</div>;
        var content=null;
        if(mode==="edit"){
            //ファイルを編集
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
            content = <FileDataForm config={this.props.config} submitButton={submit} submitDisabled={disabled} previewURL={fileurl} previewLink={fileurl} defaultFile={fileData} onSubmit={this.handleSubmit} />;
        }else if(mode==="del"){
            //ファイルを削除
            content = <FileDelForm config={this.props.config} session={this.props.session} fileid={file.id} usage={file.usage} onDel={this.handleDel}/>;
        }
        return <div>
            {menu}
            {content}
        </div>;
    },
    handleMenu(mode){
        return ()=>{
            this.setState({
                mode,
                load:false
            });
        }
    },
    handleDel(fileid){
        this.setState({
            file:null,
            mode:null,
            load:true
        });
    },
    fileLink(){
        return {
            value: this.state.file,
            requestChange: (file)=>{
                this.setState({
                    file,
                    mode: file ? "edit" : null,
                    load:false
                });
            }
        };
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

var FileDelForm = React.createClass({
    displayName:"FileDelForm",
    propTypes:{
        config: React.PropTypes.object.isRequired,
        session: React.PropTypes.object.isRequired,

        fileid: React.PropTypes.string.isRequired,
        usage: React.PropTypes.string,
        onDel: React.PropTypes.func
    },
    getInitialState(){
        return {
            mode: "start",
            used: null,
            alternativeFile: null
        };
    },
    render(){
        var mode=this.state.mode;
        if(mode==="start"){
            return <div>
                <p>このファイルを削除しますか？</p>
                <p>削除するには、下のボタンを押してください。</p>
                <form className="form">
                    <p><input type="button" className="form-single form-button" value="ファイルを削除" onClick={this.handleDel} /></p>
                </form>
            </div>;
        }else if(mode==="loading"){
            return <Loading/>;
        }else if(mode==="select"){
            var query={
                owner: this.props.session.user,
                usage: this.props.usage
            };
            var fileLink={
                value: this.state.alternativeFile,
                requestChange:(fl)=>{
                    this.setState({
                        alternativeFile: fl
                    })
                }
            };
            return <div>
                <p>このファイルは<b>{this.state.used}</b>件の正男で使用されています。ファイルを削除するには、他のファイルで置き換えてください。どのファイルで置き換えますか？</p>
                <FileList config={this.props.config} query={query} fileLink={fileLink} useDefault usePreviewLink/>
                <form className="form">
                    <input type="button" className="form-single form-button" value="ファイルを置き換えて削除" onClick={this.handleDel}/>
                </form>
            </div>;
        }
    },
    handleDel(){
        //ファイルを消すぜえええええええええええ！
        var query={
            id: this.props.fileid
        };
        if(this.state.mode==="select"){
            //代替ファイル
            query.alternativeFile = this.state.alternativeFile ? this.state.alternativeFile.id : "";
        }
        api("/api/file/del",query)
        .then((result)=>{
            if(result.success===true){
                if("function"===typeof this.props.onDel){
                    this.props.onDel(this.props.fileid);
                }
            }else{
                this.setState({
                    mode: "select",
                    used: result.used
                });
            }
        })
        .catch(errorStore.emit);
        this.setState({
            mode:"loading"
        });
    },
});

var SeriesPage=React.createClass({
    displayName:"SeriesPage",
    propTypes:{
        config: React.PropTypes.object.isRequired,
        session: React.PropTypes.object.isRequired
    },
    getInitialState(){
        return {
            loading: true,
            series: [],
            selected: null
        };
    },
    componentDidMount(){
        this.load();
    },
    load(nextId){
        api("/api/series/find",{
            owner: this.props.session.user
        })
        .then(({series})=>{
            this.setState({
                loading: false,
                series,
                selected: nextId!=null ? nextId : null
            });
        })
        .catch(errorStore.emit);
    },
    render(){
        if(this.state.loading===true){
            return <Loading/>;
        }
        var selected=this.state.selected;
        var newSeries;
        if(selected!==-1){
            newSeries=<div className="user-account-series-list-item" onClick={this.newHandler}>
                新しいシリーズを作成……
            </div>;
        }else{
            newSeries=<div className="user-account-series-list-form">
                <p>新しいシリーズを作成</p>
                <SeriesForm config={this.props.config} owner={this.props.session.user} onSubmit={this.newSubmitHandler}/>
            </div>;
        }
        var seriesForm;
        if(selected!=null && selected>=0){
            var s=this.state.series[selected];
            seriesForm=<div>
                <hr/>
                <SeriesForm config={this.props.config} owner={this.props.session.user} saveButton="保存" id={s.id} name={s.name} description={s.description} useGamesEdit onSubmit={this.saveHandler}/>
            </div>;
        }
        //シリーズをソート
        return <div className="user-account-series">
            <div className="user-account-series-list">
                {
                    this.state.series.map((obj,i)=>{
                        var c="user-account-series-list-item";
                        if(obj.id===selected){
                            c+=" user-account-series-list-item-selected";
                        }
                        return <div className={c} key={obj.id} onClick={this.selectHandler(i)}>{
                            obj.name+" ("+obj.games.length+")"
                        }</div>;
                    })
                }
                {newSeries}
            </div>
            {seriesForm}
        </div>;
    },
    selectHandler(idx){
        return (e)=>{
            this.setState({
                selected: idx
            });
        };
    },
    newHandler(e){
        this.setState({
            selected: -1
        });
    },
    newSubmitHandler({name,description}){
        api("/api/series/new",{
            name,
            description
        })
        .then(({id})=>{
            //IDを取得したので再ロード
            this.setState({
                loading: true
            });
            this.load(id);
        })
        .catch(errorStore.emit);
    },
    saveHandler({name,description,games}){
        console.log("save!!!!");
    }
});

//シリーズ管理フォーム
var SeriesForm=React.createClass({
    displayName:"SeriesForm",
    mixins: [React.addons.LinkedStateMixin],
    propTypes:{
        config: React.PropTypes.object.isRequired,
        owner: React.PropTypes.string.isRequired,
        saveButton: React.PropTypes.string,

        id: React.PropTypes.number,
        name: React.PropTypes.string,
        description: React.PropTypes.string,

        onSubmit: React.PropTypes.func.isRequired,
        useGamesEdit: React.PropTypes.bool
    },
    getDefaultProps(){
        return {
            saveButton: "保存",
            name:"",
            description:"",
        };
    },
    getInitialState(){
        return this.makeStateFromProps(this.props);
    },
    componentWillReceiveProps(newProps){
        this.setState(this.makeStateFromProps(newProps));
        this.load(newProps.id);
    },
    makeStateFromProps(props){
        return {
            loading:true,
            name: props.name,
            description: props.description,
            games: []
        };
    },
    componentDidMount(){
        this.load(this.props.id);
    },
    load(seriesId){
        api("/api/series/games",{
            series: seriesId
        })
        .then(({games})=>{
            this.setState({
                loading: false,
                games
            });
        })
        .catch(errorStore.emit);
    },
    render(){
        var config=this.props.config.series;

        var gamesArea=null;
        if(this.state.loading===true){
            gamesArea=<Loading/>;
        }else{
            var gamesLink={
                value: this.state.games,
                requestChange: (games)=>{
                    this.setState({
                        games
                    });
                }
            };
            gamesArea=<section className="user-account-seriesform-gamelist">
                <h1 className="legend">正男の一覧</h1>
                <p>現在<b>{this.state.games.length}件</b>の正男が追加されています。</p>
                <GameList config={this.props.config} owner={this.props.owner} gamesLink={gamesLink}/>
            </section>;
        }
        return <div>
            <form className="form" onSubmit={this.handleSubmit}>
                <p>
                    <label className="form-row">
                        <span>シリーズ名</span>
                        <input valueLink={this.linkState("name")} required maxLength={config.name.maxLength}/>
                    </label>
                </p>
                <p>
                    <label className="form-row">
                        <span>説明</span>
                        <textarea valueLink={this.linkState("description")} required maxLength={config.description.maxLength}/>
                    </label>
                </p>
            </form>
            {gamesArea}
            <form className="form">
                <p>
                    <input className="form-single form-button" type="submit" value={this.props.saveButton}/>
                </p>
            </form>
        </div>;
    },
    handleSubmit(e){
        e.preventDefault();
        this.props.onSubmit({
            name: this.state.name,
            description: this.state.description,
            games: this.state.games
        });
    }
});

var GameList=React.createClass({
    displayName:"GameList",
    propTypes:{
        config: React.PropTypes.object.isRequired,
        owner: React.PropTypes.string.isRequired,
        gamesLink: React.PropTypes.shape({
            value: React.PropTypes.arrayOf(React.PropTypes.object.isRequired).isRequired,
            requestChange: React.PropTypes.func.isRequired
        }).isRequired
    },
    getInitialState(){
        return {
            newMode: false
        };
    },
    render(){
        var games=this.props.gamesLink.value;
        var newArea;
        if(this.state.newMode===false){
            newArea=<div className="user-account-gamelist-item user-account-gamelist-new" onClick={this.addNewHandler}>
                新しい正男を追加...
            </div>;
        }else{
            newArea=<div className="user-account-gamelist-item user-account-gamelist-new">
                <GameListSelector owner={this.props.owner} onSelect={this.gameSelectHandler} onClose={this.closeHandler}/>
            </div>;
        }
        return <div className="user-account-gamelist">
            {
                games.map((obj)=>{
                    return <div key={obj.id} className="user-account-gamelist-item">{
                        obj.title
                    }</div>;
                })
            }
            {newArea}
        </div>;
    },
    addNewHandler(e){
        //新しい正男を追加ボタンを押した
        this.setState({
            newMode: true
        });
    },
    gameSelectHandler(game){
        //新しいゲームがきた
        var games=this.props.gamesLink.value;
        if(games.every((obj)=>{
            return game.id!==obj.id;
        })){
            //今までにはない……！（追加）
            this.props.gamesLink.requestChange(games.concat(game));
        }
    },
    closeHandler(){
        this.setState({
            newMode: false
        });
    }
});

var GameListSelector = React.createClass({
    displayName: "GameListSelector",
    propTypes:{
        owner: React.PropTypes.string.isRequired,
        onSelect: React.PropTypes.func.isRequired,
        onClose: React.PropTypes.func
    },
    getInitialState(){
        return {
            loading: true,
            games: []
        };
    },
    componentDidMount(){
        api("/api/game/find",{
            owner: this.props.owner
        })
        .then(({metadatas})=>{
            this.setState({
                loading: false,
                games: metadatas
            });
        })
        .catch(errorStore.emit);
    },
    render(){
        if(this.state.loading===true){
            return <Loading/>;
        }
        return <div className="user-account-gamelistselector">
            <p>シリーズに追加する正男を選択してください。　<span className="clickable" onClick={this.closeHandler}>閉じる</span></p>
            <div className="user-account-gamelistselector-list">{
                this.state.games.map((obj,i)=>{
                    return <div key={obj.id} className="user-account-gamelistselector-list-item" onClick={this.clickHandler(i)}>
                        {obj.title}
                    </div>;
                })
            }</div>
        </div>;
    },
    closeHandler(e){
        if(this.props.onClose){
            this.props.onClose();
        }
    },
    clickHandler(idx){
        return (e)=>{
            var game=this.state.games[idx];
            this.props.onSelect(game);
        };
    }
});


module.exports = Account;

