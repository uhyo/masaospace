import * as React from 'react';

import * as userActions from '../../actions/user';

import {
    getValue,
} from '../../scripts/react-util';

//Login Form
export interface IPropLoginForm{
}
export default class LoginForm extends React.Component<IPropLoginForm, {}>{
    render(){
        const handleSubmit = (e: React.FormEvent<HTMLFormElement>)=>{
            const userid = getValue(this, 'userid');
            const password = getValue(this, 'password');
            e.preventDefault();
            //login request
            userActions.login({
                userid,
                password,
            });
        };
        return <section className="login-form">
            <h1>ログイン</h1>
            <form className="form" onSubmit={handleSubmit}>
                <p>
                    <label className="form-row">
                        <span>ユーザーID</span>
                        <input ref="userid" />
                    </label>
                </p>
                <p>
                    <label className="form-row">
                        <span>パスワード</span>
                        <input ref="password" type="password" />
                    </label>
                </p>
                <p><input className="form-single form-button" type="submit" value="ログイン" /></p>
            </form>
            <div className="login-form-info">
                <p>アカウントをお持ちでない方は<a href="/entry/page">新規登録</a></p>
                <p>パスワードをお忘れですか？　<a href="/entry/reset">パスワードの再発行</a>ができます。</p>
            </div>
        </section>;
    }
}
