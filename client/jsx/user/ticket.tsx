import * as React from 'react';

import api from '../../actions/api';

import errorStore from '../../stores/error';

import Loading from '../commons/loading';

import { getValue } from '../../scripts/react-util';

interface IPropTicket {
  ticket: string;
  screen_name: string;
  config: any;
}
interface IStateTicket {
  state: 'loading' | 'form' | 'invalid';
  type: 'setpassword' | 'setmail' | 'resetpassword' | null;
}
export default class Ticket extends React.Component<IPropTicket, IStateTicket> {
  constructor(props: IPropTicket) {
    super(props);
    this.state = {
      state: 'loading',
      type: null,
    };
  }
  componentDidMount() {
    const { ticket } = this.props;
    api('/api/user/ticket/check', {
      token: ticket,
    })
      .then(obj => {
        if (obj.ticket === true) {
          //チケットがあった
          //チケットタイプによる分岐
          if (obj.type === 'setpassword') {
            //パスワードを設定
            this.setState({
              state: 'form',
              type: 'setpassword',
            });
          } else if (obj.type === 'setmail') {
            //メールアドレスを設定
            this.setState({
              state: 'form',
              type: 'setmail',
            });
          } else if (obj.type === 'resetpassword') {
            //パスワード再発行
            this.setState({
              state: 'form',
              type: 'resetpassword',
            });
          } else {
            //分からない
            this.setState({
              state: 'invalid',
              type: null,
            });
          }
        } else {
          //なかった
          this.setState({
            state: 'invalid',
            type: null,
          });
        }
      })
      .catch(errorStore.emit);
  }
  render() {
    const {
      props: { screen_name, ticket, config },
      state: { state, type },
    } = this;
    if (state === 'loading') {
      return <Loading />;
    }
    if (state === 'invalid') {
      return (
        <div className="information">
          <p>このURLは無効です。</p>
          <p>
            URLが発行されてから時間が経って無効となった可能性があります。もう一度最初からお試しください。
          </p>
        </div>
      );
    }
    //formだろう
    if (type === 'setpassword') {
      return (
        <section>
          <h1>パスワード設定</h1>
          <SetPassword
            screen_name={screen_name}
            ticket={ticket}
            config={config}
          />
        </section>
      );
    } else if (type === 'setmail') {
      return (
        <section>
          <h1>メールアドレス変更</h1>
          <Resolve ticket={ticket}>
            <p>メールアドレスの変更を完了しました。</p>
          </Resolve>
        </section>
      );
    } else if (type === 'resetpassword') {
      return (
        <section>
          <h1>パスワード再発行</h1>
          <ResetPassword ticket={ticket} />
        </section>
      );
    }
    return null;
  }
}

//パスワード変更フォーム
interface IPropSetPassword {
  screen_name: string;
  ticket: string;
  config: any;
}
interface IStateSetPassword {
  end: boolean;
}
class SetPassword extends React.Component<IPropSetPassword, IStateSetPassword> {
  constructor(props: IPropSetPassword) {
    super(props);
    this.state = {
      end: false,
    };
  }
  protected handleChange(e: React.SyntheticEvent<HTMLInputElement>) {
    const {
      props: { config },
    } = this;
    const t = e.currentTarget;
    const { name, value } = t;
    if (name === 'password' || name === 'password2') {
      if (name === 'password') {
        //長さチェーック
        if (value.length < config.user.password.minLength) {
          //長さがたりない
          if ((t.validity as any).tooShort !== true) {
            //自分でアレする
            t.setCustomValidity(
              'パスワードが短すぎます。最低' +
                config.user.password.minLength +
                '文字入力してください。',
            );
          }
        } else {
          t.setCustomValidity('');
        }
      }
      const password = getValue(this, 'password');
      const password2 = getValue(this, 'password2');
      if (password !== password2) {
        (this.refs.password2 as HTMLInputElement).setCustomValidity(
          'パスワードが一致しません。',
        );
      } else {
        (this.refs.password2 as HTMLInputElement).setCustomValidity('');
      }
    }
  }
  protected handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    const { ticket, screen_name } = this.props;
    e.preventDefault();
    api('/api/user/entry/setpassword', {
      token: ticket,
      screen_name: screen_name,
      password: getValue(this, 'password'),
    })
      .then(() => {
        this.setState({
          end: true,
        });
      })
      .catch(errorStore.emit);
  }
  render() {
    const config = this.props.config.user;
    const {
      props: { screen_name },
      state: { end },
    } = this;

    if (end === true) {
      return (
        <div>
          <p>ユーザー登録を完了しました。</p>
          <p>さっそく上のメニューからログインしてみましょう。</p>
        </div>
      );
    }
    const handleChange = this.handleChange.bind(this);
    return (
      <form className="form" onSubmit={this.handleSubmit.bind(this)}>
        <p>
          ユーザー
          <b>{screen_name}</b>
          のパスワードを登録します。
        </p>
        <p>
          <label className="form-row">
            <span>パスワード</span>
            <input
              type="password"
              name="password"
              ref="password"
              minLength={config.password.minLength}
              maxLength={config.password.maxLength}
              onChange={handleChange}
            />
          </label>
        </p>
        <p>
          <label className="form-row">
            <span>再入力</span>
            <input
              type="password"
              name="password2"
              ref="password2"
              minLength={config.password.minLength}
              maxLength={config.password.maxLength}
              onChange={handleChange}
            />
          </label>
        </p>
        <p>
          <input
            className="form-single form-button"
            type="submit"
            value="送信"
          />
        </p>
      </form>
    );
  }
}

//パスワード再発行
interface IPropResetPassword {
  ticket: string;
}
interface IStateResetPassword {
  end: boolean;
  show_password: boolean;
  screen_name: string;
  newpassword: string;
}
class ResetPassword extends React.Component<
  IPropResetPassword,
  IStateResetPassword
> {
  constructor(props: IPropResetPassword) {
    super(props);
    this.state = {
      end: false,
      show_password: false,
      screen_name: '',
      newpassword: '',
    };
  }
  componentDidMount() {
    api('/api/user/ticket/resolve', {
      token: this.props.ticket,
    })
      .then(obj => {
        this.setState({
          end: true,
          screen_name: obj.result.screen_name,
          newpassword: obj.result.newpassword,
        });
      })
      .catch(errorStore.emit);
  }
  render() {
    const {
      state: { end, show_password, screen_name, newpassword },
    } = this;
    if (end === false) {
      return <Loading />;
    }
    let password = null;
    if (show_password) {
      password = (
        <p>
          ユーザーIDは
          <b>{screen_name}</b>, 新しいパスワードは
          <b>{newpassword}</b>
          です。
        </p>
      );
    }
    const handleCheck = (e: React.SyntheticEvent<HTMLInputElement>) => {
      this.setState({
        show_password: e.currentTarget.checked,
      });
    };
    return (
      <div>
        <p>
          パスワードの再発行が完了しました。下のチェックボックスをチェックすると新しいパスワードが表示されます。
        </p>
        <p>ログイン後、新しくパスワードを設定しなおすことをおすすめします。</p>
        <p>
          パスワードを表示： <input type="checkbox" onChange={handleCheck} />
        </p>
        {password}
      </div>
    );
  }
}

//一般のチケットをアレする
interface IPropResolve {
  ticket: string;
}
interface IStateResolve {
  end: boolean;
}
class Resolve extends React.Component<IPropResolve, IStateResolve> {
  constructor(props: IPropResolve) {
    super(props);
    this.state = {
      end: false,
    };
  }
  componentDidMount() {
    api('/api/user/ticket/resolve', {
      token: this.props.ticket,
    })
      .then(() => {
        this.setState({
          end: true,
        });
      })
      .catch(errorStore.emit);
  }
  render() {
    if (this.state.end === false) {
      return <Loading />;
    }
    return <div>{this.props.children}</div>;
  }
}
