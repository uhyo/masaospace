import * as React from 'react';

import api from '../../actions/api';

import errorStore from '../../stores/error';

import {
    getValue,
} from '../../scripts/react-util';

interface IPropReset{
    config: any;
}
interface IStateReset{
    end: boolean;
}
export default class Reset extends React.Component<IPropReset, IStateReset>{
    constructor(props: IPropReset){
        super(props);
        this.state = {
            end: false,
        };
    }
    render(){
        const {
            state: {
                end,
            },
        } = this;
        if(end){
            //成功した
            return <section>
                <h1>パスワード再発行</h1>
                <p>登録されたメールアドレスにメールを送信しました。</p>
            </section>;
        }
        return <section>
            <h1>パスワード再発行</h1>
            <p>パスワードが分からなくなった場合は、このフォームからパスワードを再発行できます。</p>
            <p><b>ユーザーID</b>か<b>メールアドレス</b>を入力してください。登録したメールアドレスに再発行用のURLが送信されます。</p>
            <div className="user-reset-form-wrapper">
                <form className="form" onSubmit={this.handleSubmit.bind(this)}>
                    <p>
                        <input ref="id_or_mail" className="form-single" />
                    </p>
                    <p>
                        <input className="form-single form-button" type="submit" value="送信" />
                    </p>
                </form>
            </div>
        </section>;
    }
    protected handleSubmit(e: React.SyntheticEvent<HTMLElement>){
        e.preventDefault();
        api("/api/user/entry/reset", {
            id_or_mail: getValue(this, 'id_or_mail'),
        })
        .then(()=>{
            this.setState({
                end: true,
            });
        })
        .catch(errorStore.emit);
    }
}
