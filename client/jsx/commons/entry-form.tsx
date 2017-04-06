import * as React from 'react';

import api from '../../actions/api';

import errorStore from '../../stores/error';

interface IPropEntryForm{
    config: any;
}
interface IStateEntryForm{
    form: boolean;
    mail: string;
}
export default class EntryForm extends React.Component<IPropEntryForm, IStateEntryForm>{
    constructor(props: IPropEntryForm){
        super(props);

        this.state = {
            form: true,
            mail: '',
        };
    }
    protected handleSubmit(e: React.FormEvent<HTMLFormElement>){
        e.preventDefault();
        //entry request
        api("/api/user/entry",{
            screen_name: this.getFormValue('screen_name'),
            name: this.getFormValue('name'),
            mail: this.getFormValue('mail'),
        })
        .then((obj)=>{
            this.setState({
                form:false,
                mail: obj.mail,
            });
        })
        .catch(errorStore.emit);
    }
    protected getFormValue(name: string): string{
        return (this.refs[name] as HTMLInputElement).value;
    }
    render(){
        const config=this.props.config.user;
        if(this.state.form){
            return <div>
                <form className="form" onSubmit={this.handleSubmit.bind(this)}>
                    <p>
                        <label className="form-row">
                            <span>ユーザーID</span>
                            <input ref="screen_name" minLength={config.screenName.minLength} maxLength={config.screenName.maxLength} required />
                        </label>
                    </p>
                    <p>
                        <label className="form-row">
                            <span>ユーザー名</span>
                            <input ref="name" required />
                        </label>
                    </p>
                    <p>
                        <label className="form-row">
                            <span>メールアドレス</span>
                            <input type="email" ref="mail" required />
                        </label>
                    </p>
                    <p><input className="form-single form-button" type="submit" value="登録" /></p>
                </form>
                <p>ユーザーID・ユーザー名を決めてください。</p>
                <p>入力したメールアドレスに登録手続用のメールが送信されます。</p>
                <p>入力したメールアドレスは公開されません。</p>
            </div>;
        }else{
            return <div>
                <p><b>{this.state.mail}</b>に登録手続用のメールを送信しました。</p>
                <p>メールに掲載されたリンクから登録手続を進めてください。</p>
                <p>このページは閉じても構いません。</p>
            </div>;
        }
    }
}
