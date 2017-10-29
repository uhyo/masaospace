import * as React from 'react';

import * as userAction from '../../actions/user';
import errorStore from '../../stores/error';
import api from '../../actions/api';

import NeedLogin from '../commons/need-login';
import Loading from '../commons/loading';
import HorizontalMenu from '../commons/horizontal-menu';
import FileList from '../file/file-list';
import FileDataForm from '../file/file-data-form';
import UserIcon from '../commons/user-icon';

import {
    getValue,
} from '../../scripts/react-util';
import {
    UserDataWithId,
    File,
    Session,
    Series,
    GameMetadata,
    ResourceKind,
} from '../data';

export interface IPropAccount{
    config: any;
    session: Session;
}
export interface IStateAccount{
    page: 'profile' | 'password' | 'mail' | 'file' | 'series';
    userdata: UserDataWithId | null;
}
export default class Account extends React.Component<IPropAccount, IStateAccount>{
    constructor(props: IPropAccount){
        super(props);
        this.state = {
            page: 'profile',
            userdata: null,
        };
    }
    componentDidMount(){
        this.loadUserdata(this.props.session);
    }
    componentWillReceiveProps(nextProps: IPropAccount){
        if(this.props.session !== nextProps.session){
            this.onSessionChange(nextProps.session);
        }
    }
    render(){
        return <section>
            <h1>アカウント設定</h1>
            {this.props.session.loggedin===true ? this.content() : <NeedLogin/>}
        </section>;
    }
    protected content(){
        const pages=[{
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
        const pageChange = (page: IStateAccount['page'])=>{
            this.setState({
                page,
            });
        };
        return <div>
            <HorizontalMenu contents={pages} page={this.state.page} onChange={pageChange} />
            {this.main()}
        </div>;
    }
    protected main(){
        const {
            props: {
                config,
                session,
            },
            state: {
                page,
                userdata,
            },
        } = this;
        
        if (userdata == null){
            return <Loading />;
        }
        if(page==="profile"){
            //プロフィール
            return <ProfileForm config={config} userdata={userdata}/>;
        }else if(page==="password"){
            return <ChangePasswordForm config={config}/>;
        }else if(page==="mail"){
            return <MailForm userdata={userdata}/>;
        }else if(page==="file"){
            return <FilePage config={config} session={session}/>;
        }else if(page==="series"){
            return <SeriesPage config={config} session={session}/>;
        }
        return null;
    }
    protected onSessionChange(session: any){
        if(session.loggedin===false){
            //ログアウトした
            this.setState({
                userdata: null,
            });
        }else{
            this.loadUserdata(session);
        }
    }
    protected loadUserdata(_session: Session){
        // FIXME
        api("/api/user/mydata")
        .then((obj)=>{
            this.setState({
                userdata: obj.data,
            });
        })
        .catch(errorStore.emit);
    }
}

//サブコンテンツ
interface IPropProfileForm{
    config: any;
    userdata: UserDataWithId;
}
interface IStateProfileForm{
    name: string;
    profile: string;
    url: string;
    icon: string | null;
    modified: boolean;
}
class ProfileForm extends React.Component<IPropProfileForm, IStateProfileForm>{
    constructor(props: IPropProfileForm){
        super(props);
        this.state = this.makeStateFromProps(props);
    }
    protected makeStateFromProps(props: IPropProfileForm): IStateProfileForm{
        const {
            userdata,
        } = props;
        return {
            //user data form
            name: userdata.name || "",
            profile: userdata.profile || "",
            icon: userdata.icon || null,
            url: userdata.url || "",
            //modified flag
            modified: false,
        };
    }
    componentWillReceiveProps(newProps: IPropProfileForm){
        if(this.props.userdata !== newProps.userdata){
            this.setState(this.makeStateFromProps(newProps));
        }
    }
    handleChange(e: React.SyntheticEvent<HTMLInputElement>){
        const n = e.currentTarget.name;
        if(n==="name" || n==="profile" || n==="url"){
            this.setState({
                [n]: e.currentTarget.value,
                modified: true,
            } as any);
        }
    }
    handleSubmit(e: React.SyntheticEvent<HTMLFormElement>){
        e.preventDefault();
        userAction.update({
            name: this.state.name,
            profile: this.state.profile,
            icon: this.state.icon,
            url: this.state.url
        });
    }
    render(){
        const {
            props: {
                config,
                userdata,
            },
            state: {
                name,
                url,
                profile,
                icon,
                modified,
            },
        } = this;

        if(userdata==null){
            return <Loading/>;
        }

        const handleChange = this.handleChange.bind(this);
        const handleSubmit = this.handleSubmit.bind(this);
        const handleIconChange = (file: File | null)=>{
            this.setState({
                icon: file ? file.id : null,
                modified: true,
            });
        };
        return (<div>
            <IconEdit config={config} userdata={userdata} icon={icon} onChange={handleIconChange} />
            <form className="form" onSubmit={handleSubmit}>
                <p>
                    <label className="form-row">
                        <span>ユーザーID</span>
                        <input type="text" readOnly value={userdata.screen_name} />
                    </label>
                </p>
                <p>
                    <label className="form-row">
                        <span>メールアドレス</span>
                        <input type="email" readOnly value={userdata.mail} />
                    </label>
                </p>
                <p>
                    <label className="form-row">
                        <span>ユーザー名</span>
                        <input type="text" name="name" defaultValue={name} onChange={handleChange} />
                    </label>
                </p>
                <p>
                    <label className="form-row">
                        <span>ウェブサイトのURL</span>
                        <input type="url" name="url" defaultValue={url} onChange={handleChange} />
                    </label>
                </p>
                <p>
                    <label className="form-row">
                        <span>プロフィール</span>
                        <textarea name="profile" value={profile} onChange={handleChange} />
                    </label>
                </p>
                <p><input className="form-single form-button" type="submit" value={"変更を保存"+ (modified ? " …" : "")} /></p>
            </form>
        </div>
        );
    }
}

interface IPropIconEdit{
    config: any;
    userdata: UserDataWithId;
    icon: string | null;
    onChange(icon: File | null): void;
}
interface IStateIconEdit{
    edit: boolean;
}
class IconEdit extends React.Component<IPropIconEdit, IStateIconEdit>{
    constructor(props: IPropIconEdit){
        super(props);

        this.state = {
            edit: false,
        };
    }
    render(){
        const {
            props: {
                config,
                userdata,
                icon,
                onChange,
            },
            state: {
                edit,
            },
        } = this;
        let filelist = null;
        if(edit === true){
            const query = {
                owner: userdata.id,
                usage: "other" as ResourceKind,
            };
            filelist = <FileList config={config} query={query} currentFile={icon || void 0} onChange={onChange} useDefault usePreviewLink/>;
        }
        const handleIconEdit = ()=>{
            this.setState({
                edit: true,
            });
        }
        return <div className="user-account-profile-icon-wrapper">
            <div className="user-account-profile-icon-menu">
                <div className="user-account-profile-icon-preview" onClick={handleIconEdit}>
                    <UserIcon icon={icon} size={128} />
                </div>
                <div>
                    <p>アイコンは最大128×128で表示されることがあります。</p>
                    {icon ? null : <p>アイコンが設定されていません。</p>}
                    {edit ? <p>アイコンを変更したら、下の保存ボタンを押してください。</p> : <p>アイコンをクリックして変更できます。</p>}
                </div>
            </div>
            {filelist}
        </div>;
    }
}

interface IPropChangePasswordForm{
    config: any;
}
interface IStateChangePasswordForm{
    form: boolean;
}
class ChangePasswordForm extends React.Component<IPropChangePasswordForm, IStateChangePasswordForm>{
    constructor(props: IPropChangePasswordForm){
        super(props);
        this.state = {
            form: true,
        };
    }
    handleChange(e: React.SyntheticEvent<HTMLInputElement>){
        const t = e.currentTarget;
        const name = t.name;
        if(name==="current" || name==="password" || name==="password2"){
            if(name==="current" || name==="password"){
                //長さチェック(TODO: まとめる)
                
                if(t.value.length < this.props.config.user.password.minLength){
                    //長さがたりない
                    if((t.validity as any).tooShort!==true){
                        //自分でアレする
                        t.setCustomValidity("パスワードが短すぎます。最低"+this.props.config.user.password.minLength+"文字入力してください。");
                    }
                }else{
                    t.setCustomValidity("");
                }
            }
            const password = getValue(this, 'password');
            const password2 = getValue(this, 'password2');
            if(password !== password2){
                (this.refs.password2 as HTMLInputElement).setCustomValidity("パスワードが一致しません。");
            }else{
                (this.refs.password2 as HTMLInputElement).setCustomValidity("");
            }
        }
    }
    protected handleSubmit(e: React.SyntheticEvent<HTMLFormElement>){
        e.preventDefault();
        //login request
        api("/api/user/changepassword",{
            oldpassword: getValue(this, 'current'),
            newpassword: getValue(this, 'password'),
        })
        .then(()=>{
            this.setState({
                form: false,
            });
        })
        .catch(errorStore.emit);
    }
    render(){
        const config=this.props.config.user;
        const {
            form,
        } = this.state;

        const handleChange = this.handleChange.bind(this);
        if(form){
            return (
                <section>
                    <h1>パスワード変更</h1>
                    <div className="user-changepassword-form-wrapper">
                        <form className="form" onSubmit={this.handleSubmit.bind(this)}>
                            <p>
                                <label className="form-row">
                                    <span>現在のパスワード</span>
                                    <input type="password" name="current" ref="current" minLength={config.password.minLength} maxLength={config.password.maxLength} required onChange={handleChange} />
                                </label>
                            </p>
                            <p>
                                <label className="form-row">
                                    <span>新しいパスワード</span>
                                    <input type="password" name="password" ref="password" minLength={config.password.minLength} maxLength={config.password.maxLength} required onChange={handleChange} />
                                </label>
                            </p>
                            <p>
                                <label className="form-row">
                                    <span>再入力</span>
                                    <input type="password" name="password2" ref="password2" minLength={config.password.minLength} maxLength={config.password.maxLength} required onChange={handleChange} />
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
}

interface IPropMailForm{
    userdata: UserDataWithId;
}
interface IStateMailForm{
    end: boolean;
    mail: string;
}
class MailForm extends React.Component<IPropMailForm, IStateMailForm>{
    constructor(props: IPropMailForm){
        super(props);
        this.state = {
            end: false,
            mail: '',
        };
    }
    protected handleSubmit(e: React.SyntheticEvent<HTMLFormElement>){
        e.preventDefault();
        const mail = getValue(this, 'mail');
        api("/api/user/changemail", {
            mail,
        })
        .then(()=>{
            this.setState({
                end: true,
                mail,
            });
        })
        .catch(errorStore.emit);
    }
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
                <form className="form" onSubmit={this.handleSubmit.bind(this)}>
                    <p>
                        <label className="form-row">
                            <span>メールアドレス</span>
                            <input type="email" ref="mail" required />
                        </label>
                    </p>
                    <p><input className="form-single form-button" type="submit" value="送信" /></p>
                </form>
            </div>
        );
    }
}

interface IPropFilePage{
    session: Session;
    config: any;
}
interface IStateFilePage{
    saving: boolean;
    load: boolean;
    file: File | null;
    mode: 'edit' | 'del' | null;
}
class FilePage extends React.Component<IPropFilePage, IStateFilePage>{
    constructor(props: IPropFilePage){
        super(props);
        this.state = {
            saving: false,
            load: false,
            file: null,
            mode: null,
        };
    }
    render(){
        const {
            props: {
                session,
                config,
            },
            state: {
                file,
                load,
            },
        } = this;
        const query = {
            owner: session.user,
        };
        const handleFileChange = (file: File | null)=>{
            this.setState({
                file,
                mode: file ? 'edit' : null,
                load: false,
            });
        };
        return <div>
            <FileList config={config} query={query} forceLoad={load} diskSpace currentFile={file || void 0} onChange={handleFileChange} />
            {this.form()}
        </div>;
    }
    protected form(){
        const {
            props: {
                config,
                session,
            },
            state: {
                file,
                mode,
                saving,
            },
        } = this;

        if(file == null){
            //ファイルが選択されていなかったらなにも表示しない
            return null;
        }
        const menu = <div className="icon-menu">{
            ["edit","del"].map((md: 'edit' | 'del')=>{
                const onClick = ()=>{
                    this.setState({
                        mode: md,
                        load: false,
                    });
                };
                const selected = md===mode ? " icon-menu-current" : "";
                return <div key={md} className={"icon-menu-item"+selected} onClick={onClick}>
                    <span className={"icon icon-file"+md}/>
                </div>;
            })
        }</div>;
        let content = null;
        if(mode === 'edit'){
            //ファイルを編集
            const fileData = {
                type: file.type,
                name: file.name,
                usage: file.usage,
                description: file.description,
            };
            let submit, disabled;
            if(saving ===true){
                submit = "保存中……";
                disabled = true;
            }else{
                submit = "保存";
                disabled = false;
            }
            const fileurl = `/uploaded/${file.id}`;
            content = <FileDataForm config={config} submitButton={submit} submitDisabled={disabled} previewURL={fileurl} previewLink={fileurl} defaultFile={fileData} onSubmit={this.handleSubmit.bind(this)} />;
        }else if(mode==="del"){
            const handleDel = ()=>{
                this.setState({
                    file: null,
                    mode: null,
                    load: true,
                });
            };

            //ファイルを削除
            content = <FileDelForm config={config} session={session} fileid={file.id} usage={file.usage} onDel={handleDel}/>;
        }
        return <div>
            {menu}
            {content}
        </div>;
    }
    protected handleSubmit(file: File){
        //ファイルのメタデータを編集するぞーーーーーーーーーーーーーーー
        var filedata = {
            id: this.state.file!.id,
            name: file.name,
            type: file.type,
            size: file.size,
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
            file: filedata,
        });
    }
}

interface IPropFileDelForm{
    config: any;
    session: Session;
    fileid: string;
    usage?: ResourceKind;
    onDel(fileid: string): void;
}
interface IStateFileDelForm{
    mode: 'start' | 'loading' | 'select';
    used: number;
    alternativeFile: File | null;
}
class FileDelForm extends React.Component<IPropFileDelForm, IStateFileDelForm>{
    constructor(props: IPropFileDelForm){
        super(props);
        this.state = {
            mode: 'start',
            used: 0,
            alternativeFile: null,
        };
        this.handleDel = this.handleDel.bind(this);
    }
    render(){
        const {
            props: {
                config,
                session,
                usage,
            },
            state: {
                mode,
                alternativeFile,
            },
        } = this;
        if(mode === 'start'){
            return <div>
                <p>このファイルを削除しますか？</p>
                <p>削除するには、下のボタンを押してください。</p>
                <form className="form">
                    <p><input type="button" className="form-single form-button" value="ファイルを削除" onClick={this.handleDel} /></p>
                </form>
            </div>;
        }else if(mode === 'loading'){
            return <Loading/>;
        }else if(mode === 'select'){
            const query={
                owner: session.user,
                usage,
            };
            const handleChange = (fi: File | null)=>{
                this.setState({
                    alternativeFile: fi,
                });
            };
            return <div>
                <p>このファイルは<b>{this.state.used}</b>件の正男で使用されています。ファイルを削除するには、他のファイルで置き換えてください。どのファイルで置き換えますか？</p>
                <FileList config={config} query={query} currentFile={alternativeFile || void 0} onChange={handleChange} useDefault usePreviewLink/>
                <form className="form">
                    <input type="button" className="form-single form-button" value="ファイルを置き換えて削除" onClick={this.handleDel.bind(this)}/>
                </form>
            </div>;
        }
        return null;
    }
    protected handleDel(){
        //ファイルを消すぜえええええええええええ！
        const {
            props: {
                fileid,
                onDel,
            },
            state: {
                mode,
                alternativeFile,
            },
        } = this;
        const query: any = {
            id: fileid,
        };
        if(mode === 'select'){
            //代替ファイル
            query.alternativeFile = alternativeFile ? alternativeFile.id : '';
        }
        api("/api/file/del",query)
        .then((result)=>{
            if(result.success===true){
                if("function"===typeof onDel){
                    onDel(fileid);
                }
            }else{
                this.setState({
                    mode: "select",
                    used: result.used,
                });
            }
        })
        .catch(errorStore.emit);
        this.setState({
            mode: 'loading',
        });
    }
}

interface IPropSeriesPage{
    config: any;
    session: Session;
}
interface IStateSeriesPage{
    loading: boolean;
    series: Array<Series>;
    selected: number | null;
}
class SeriesPage extends React.Component<IPropSeriesPage, IStateSeriesPage>{
    constructor(props: IPropSeriesPage){
        super(props);
        this.state = {
            loading: true,
            series: [],
            selected: null,
        };
    }
    componentDidMount(){
        this.load();
    }
    protected load(nextId?: number){
        api("/api/series/find",{
            owner: this.props.session.user,
        })
        .then(({series})=>{
            //nextIdに該当するシリーズを探す
            let selected = null;
            for(let i=0; i < series.length; i++){
                if(series[i].id === nextId){
                    selected = i;
                    break;
                }
            }
            this.setState({
                loading: false,
                series,
                selected,
            });
        })
        .catch(errorStore.emit);
    }
    render(){
        const {
            props: {
                config,
                session,
            },
            state: {
                loading,
                selected,
                series,
            },
        } = this;
        if(loading === true){
            return <Loading/>;
        }
        let newSeries;
        if(selected !== -1){
            const newHandler = ()=>{
                this.setState({
                    selected: -1,
                });
            };
            newSeries = <div className="vertical-menu-item vertical-menu-selectable" onClick={newHandler}>
                新しいシリーズを作成...
            </div>;
        }else{
            newSeries = <div className="vertical-menu-item">
                <p>新しいシリーズを作成</p>
                <SeriesForm config={config} owner={session.user} onSubmit={this.newSubmitHandler.bind(this)}/>
            </div>;
        }
        let seriesForm;
        if(selected!=null && selected>=0){
            const s = this.state.series[selected];
            seriesForm = <div>
                <hr/>
                <p>※「保存」ボタンを押さないと変更が保存されません。</p>
                <SeriesForm config={config} owner={session.user} saveButton="保存" id={s.id} name={s.name} description={s.description} useGamesEdit onSubmit={this.saveHandler.bind(this)}/>
            </div>;
        }
        //シリーズをソート
        return <div className="user-account-series">
            <div className="vertical-menu">
                {
                    series.map(({id, name, games},i)=>{
                        var c="vertical-menu-item vertical-menu-selectable";
                        if(i===selected){
                            c+=" vertical-menu-item-selected";
                        }
                        const selectHandler = ()=>{
                            this.setState({
                                selected: i,
                            });
                        };
                        return <div className={c} key={id} onClick={selectHandler}>
                        {name} ({games.length})
                        </div>;
                    })
                }
                {newSeries}
            </div>
            {seriesForm}
        </div>;
    }
    protected newSubmitHandler({name,description}: Series){
        api("/api/series/new",{
            name,
            description
        })
        .then(({id})=>{
            //IDを取得したので再ロード
            this.setState({
                loading: true,
            });
            this.load(id);
        })
        .catch(errorStore.emit);
    }
    protected saveHandler({name,description,games}: Series){
        api("/api/series/save",{
            id: this.state.series[this.state.selected!].id,
            name,
            description,
            games: games.join(",")
        })
        .then(()=>{
            this.setState({
                loading: true
            });
            this.load();
        })
        .catch(errorStore.emit);
    }
}

//シリーズ管理フォーム
interface IPropSeriesForm{
    config: any;
    owner: string;
    saveButton?: string;
    id?: number;
    name?: string;
    description?: string;
    onSubmit(series: Pick<Series, 'name' | 'description' | 'games'>): void;
    useGamesEdit?: boolean;
}
interface IStateSeriesForm{
    loading: boolean;
    games: Array<GameMetadata>;
}
class SeriesForm extends React.Component<IPropSeriesForm, IStateSeriesForm>{
    constructor(props: IPropSeriesForm){
        super(props);
        this.state = this.makeStateFromProps(props);
    }
    componentWillReceiveProps(newProps: IPropSeriesForm){
        this.setState(this.makeStateFromProps(newProps));
        if(newProps.useGamesEdit===true && newProps.id != null){
            this.load(newProps.id);
        }
    }
    protected makeStateFromProps(props: IPropSeriesForm){
        return {
            loading: !!props.useGamesEdit,
            games: [],
        };
    }
    componentDidMount(){
        const {
            useGamesEdit,
            id,
        } = this.props;
        if(useGamesEdit===true && id != null){
            this.load(id);
        }
    }
    protected load(seriesId: number){
        api("/api/series/games",{
            series: seriesId,
        })
        .then(({games})=>{
            this.setState({
                loading: false,
                games,
            });
        })
        .catch(errorStore.emit);
    }
    render(){
        const {
            props: {
                name,
                description,
                owner,
                saveButton,
                useGamesEdit,
            },
            state: {
                loading,
                games,
            },
        } = this;
        const config = this.props.config.series;

        let gamesArea = null;
        if(loading===true){
            gamesArea = <Loading/>;
        }else if(useGamesEdit===true){
            const handleGamesChange = (games: Array<GameMetadata>)=>{
                this.setState({
                    games,
                });
            };
            gamesArea = <section className="user-account-seriesform-gamelist">
                <h1 className="legend">正男の一覧</h1>
                <p>現在<b>{games.length}件</b>の正男が追加されています。正男はドラッグ&amp;ドロップで並び替えができます。</p>
                <GameList config={this.props.config} owner={owner} games={games} onChange={handleGamesChange} />
            </section>;
        }
        const handleSubmit = this.handleSubmit.bind(this);
        return <div>
            <form className="form" onSubmit={handleSubmit}>
                <p>
                    <label className="form-row">
                        <span>シリーズ名</span>
                        <input ref="name" required maxLength={config.name.maxLength} defaultValue={name} />
                    </label>
                </p>
                <p>
                    <label className="form-row">
                        <span>説明</span>
                        <textarea ref="description" defaultValue={description} required maxLength={config.description.maxLength} />
                    </label>
                </p>
            </form>
            {gamesArea}
            <form className="form">
                <p>
                    <input className="form-single form-button" type="button" value={saveButton || '保存'} onClick={handleSubmit}/>
                </p>
            </form>
        </div>;
    }
    protected handleSubmit(e: React.SyntheticEvent<HTMLFormElement>){
        e.preventDefault();
        this.props.onSubmit({
            name: getValue(this, 'name'),
            description: getValue(this, 'description'),
            games: this.state.games.map(({id})=>id),
        });
    }
}

interface IPropGameList{
    config: any;
    owner: string;
    games: Array<GameMetadata>;
    onChange(games: Array<GameMetadata>): void;
}
interface IStateGameList{
    newMode: boolean;
    dragging: boolean;
    dragged: number | null;
    dragTarget: any;
}
class GameList extends React.Component<IPropGameList, IStateGameList>{
    constructor(props: IPropGameList){
        super(props);
        this.state = {
            newMode: false,
            dragging: false,
            dragged: null,
            dragTarget: null,
        };
    }
    render(){
        const {
            props: {
                owner,
                games,
                onChange,
            },
            state: {
                newMode,
                dragging,
                dragged,
                dragTarget,
            },
        } = this;
        let newArea, nmo;
        let c = "vertical-menu-item";
        if(dragTarget === games.length){
            c+=" user-account-gamelist-dragtarget";
        }
        if(dragging === true){
            nmo = this.handleMouseMove(games.length);
        }
        if(newMode === false){
            c+=" vertical-menu-selectable";
            const addNewHandler = ()=>{
                this.setState({
                    newMode: true,
                });
            };
            newArea = <div className={c} onClick={addNewHandler} onMouseOver={nmo}>
                新しい正男を追加...
            </div>;
        }else{
            c += " vertical-menu-separate";
            const closeHandler = ()=>{
                this.setState({
                    newMode: false,
                });
            };
            newArea = <div className={c} onMouseOver={nmo}>
                <GameListSelector owner={owner} onSelect={this.gameSelectHandler.bind(this)} onClose={closeHandler}/>
            </div>;
        }
        let mouseup=null;
        if(dragging === true){
            mouseup = this.handleMouseUp.bind(this);
        }
        return <div className="vertical-menu" onMouseUp={mouseup}>
            {
                games.map((obj,i)=>{
                    var mousemove;
                    if(this.state.dragging===true){
                        mousemove = this.handleMouseMove(i);
                    }
                    var c="vertical-menu-item vertical-menu-selectable";
                    if(dragTarget === i){
                        //この上にドラッグ
                        c+=" user-account-gamelist-dragtarget";
                    }
                    if(dragged === i){
                        //これがドラッグされてる
                        c+=" vertical-menu-item-selected";
                    }
                    const handleMouseDown = (e: React.MouseEvent<HTMLElement>)=>{
                        e.preventDefault();
                        this.setState({
                            dragging: true,
                            dragged: i,
                            dragTarget: i,
                        });
                    };
                    const handleGameDel = ()=>{
                        // i番目を消去
                        const result = [...games];
                        result.splice(i, 1);
                        onChange(result);
                    };
                    return <div key={obj.id} className={c} onMouseDown={handleMouseDown} onMouseMove={mousemove}>
                        <span>{obj.title}</span>
                        <span className="user-account-gamelist-del" onClick={handleGameDel}>✖</span>
                    </div>;
                })
            }
            {newArea}
        </div>;
    }
    protected handleMouseUp(){
        //ゲームを移動する
        const {
            props: {
                games,
                onChange,
            },
            state: {
                dragTarget,
                dragged,
            },
        } = this;
        if (dragged == null){
            return;
        }
        const result = [...games];
        let pushTarget = dragTarget;
        if(dragged < pushTarget){
            pushTarget--;
        }
        const [p] = result.splice(dragged, 1);
        result.splice(pushTarget, 0, p);
        this.setState({
            dragging: false,
            dragged: null,
            dragTarget: null,
        },()=>{
            onChange(result);
        });
    }
    protected handleMouseMove(idx: number){
        return (e: React.MouseEvent<HTMLElement>)=>{
            const {
                games,
            } = this.props;

            var {currentTarget, pageY} = e;
            //position: absoluteとかはないよね……（決め打ち）
            const t = currentTarget.offsetTop;
            const h = currentTarget.offsetHeight;

            const th = t+h/2;
            if(idx < games.length){
                if(pageY <= th){
                    //上半分
                    this.setState({
                        dragTarget: idx,
                    });
                }else{
                    this.setState({
                        dragTarget: idx+1,
                    });
                }
            }else{
                this.setState({
                    dragTarget: idx,
                });
            }
        };
    }
    protected gameSelectHandler(game: GameMetadata){
        //新しいゲームがきた
        const {
            games,
            onChange,
        } = this.props;

        if(games.every(({id})=>{
            return game.id !== id;
        })){
            //今までにはない……！（追加）
            onChange([
                ...games,
                game,
            ]);
        }
    }
}

interface IPropGameListSelector{
    owner: string;
    onSelect(game: GameMetadata): void;
    onClose?(): void;
}
interface IStateGameListSelector{
    loading: boolean;
    games: Array<GameMetadata>;
}
class GameListSelector extends React.Component<IPropGameListSelector, IStateGameListSelector>{
    constructor(props: IPropGameListSelector){
        super(props);
        this.state = {
            loading: true,
            games: [],
        };
    }
    componentDidMount(){
        api("/api/game/find", {
            owner: this.props.owner,
        })
        .then(({metadatas})=>{
            this.setState({
                loading: false,
                games: metadatas,
            });
        })
        .catch(errorStore.emit);
    }
    render(){
        const {
            props: {
                onSelect,
                onClose,
            },
            state: {
                loading,
                games,
            },
        } = this;
        if(loading === true){
            return <Loading/>;
        }
        const closeHandler = ()=>{
            if (onClose){
                onClose();
            }
        };
        return <div>
            <p>シリーズに追加する正男を選択してください。　<span className="clickable" onClick={closeHandler}>閉じる</span></p>
            <div className="vertical-menu">{
                games.map(({id, title},i)=>{
                    const clickHandler = ()=>{
                        onSelect(games[i]);
                    };
                    return <div key={id} className="vertical-menu-item vertical-menu-selectable" onClick={clickHandler}>
                        {title}
                    </div>;
                })
            }</div>
        </div>;
    }
}

