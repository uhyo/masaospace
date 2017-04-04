import * as React from 'react';

import {
    RefluxComponent,
} from '../scripts/reflux-util';

import * as userAction from '../actions/user';
import errorStore, {
    ErrorState,
} from '../stores/error';

import LoginForm from './commons/login-form';
import UserIcon from './commons/user-icon';

import {
    Session,
} from './data';

export interface IPropHeader{
    session: Session;
}
export interface IStateHeader{
    loginform: boolean;
}
export default class Header extends React.Component<IPropHeader, IStateHeader>{
    constructor(props: IPropHeader){
        super(props);
        this.setState({
            loginform: false,
        });
    }
    protected handleLogout(e: React.SyntheticEvent<HTMLElement>){
        e.preventDefault();
        userAction.logout(void 0);
    }
    protected handleLogin(e: React.SyntheticEvent<HTMLElement>){
        e.preventDefault();
        this.setState({
            loginform: true,
        });
    }
    render(){
        const {
            props: {
                session,
            },
        } = this;

        return (<div className="root-header">
            <div className="root-header-topnavi">
                <a href="/">トップページ</a>
            </div>
            <div className="root-header-bar">
                <ul className="root-header-menu">
                    {
                        (session.loggedin===true ?
                         [
                            (<li key="my">
                                <a href="/my">
                                    <span className="icon icon-home"/>
                                    <span>マイページ</span>
                                </a>
                            </li>),
                            (<li key="plus">
                                <a href="/game/new">
                                    <span className="icon icon-masaoplus"/>
                                    <span>正男を投稿</span>
                                </a>
                            </li>),
                            (<li key="logout">
                                <a onClick={this.handleLogout.bind(this)}>ログアウト</a>
                            </li>)
                        ]
                            :
                                <li key="login">
                                    <a onClick={this.handleLogin.bind(this)}>ログイン</a>
                                </li>
                                )
                    }
                </ul>
            </div>
            <div className="root-header-session">
                {
                    session.loggedin===true ? this.loggedin() : this.notLoggedin()
                }
            </div>
            {
                (session.loggedin!==true && this.state.loginform===true ?
                    <div className="root-header-loginform">
                        <LoginForm />
                    </div>
                    : null)
            }
            <GlobalMessages />
        </div>);
    }
    protected loggedin(){
        const {
            session,
        } = this.props;
        return <a href="/my/account">
            <div className="root-header-session-loggedin">
                <UserIcon icon={session.icon} size={32} />
                <p>{session.name} さん</p>
            </div>
        </a>;
    }
    protected notLoggedin(){
        return null;
    }
}

//エラーメッセージを集約
interface IDefnGlobalMessages{
    error: ErrorState;
}
interface IStateGlobalMessages{
    logs: Array<void>;
}
class GlobalMessages extends RefluxComponent<IDefnGlobalMessages, {}, IStateGlobalMessages>{
    protected reset(){
        errorStore.reset();
    }
    render(){
        const {
            error: {
                logs,
            },
        } = this.state;
        return <div className="header-logs">
            {this.resetButton()}
            <div>{
                logs.map((log,i)=>{
                    return <p key={i}>{log}</p>;
                })
            }</div>
        </div>;
    }
    protected resetButton(){
        if(this.state.logs.length===0){
            return null;
        }
        return <p className="header-logs-resetbutton" onClick={this.reset}>
            <span>×</span>
        </p>;
    }
}

