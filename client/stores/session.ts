import { Store } from '../scripts/reflux-util';

import * as userAction from '../actions/user';

/*
 * serverの場合nullになることも！
 * sessionStore {
 *   loggedin: <boolean>,
 *   user: <string>,
 *   screen_name: <string>,
 *   name: <string>,
 *   icon: <string>,
 *   url: <string>
 * }
 */
export interface SessionState {
  loggedin: boolean;
  user: string;
  screen_name: string;
  name: string;
  profile: string;
  icon: string | null;
  url: string;
}
export class SessionStore extends Store<SessionState> {
  constructor() {
    super();

    this.state = {
      loggedin: false,
      user: '',
      screen_name: '',
      name: '',
      profile: '',
      icon: '',
      url: '',
    };

    this.listenables = {
      init: userAction.init,
      login: userAction.login.completed,
      logout: userAction.logout.completed,
      update: userAction.update.completed,
    };
  }
  protected onInit(init: SessionState) {
    this.setState(init);
  }
  protected onLogin(loginresult: userAction.LoginResult) {
    this.setState({
      loggedin: true,
      user: loginresult.user,
      screen_name: loginresult.screen_name,
      name: loginresult.name,
      profile: loginresult.profile,
      icon: loginresult.icon,
      url: loginresult.url,
    });
  }
  protected onLogout() {
    this.setState({
      loggedin: false,
      user: '',
      screen_name: '',
      name: '',
      profile: '',
      icon: '',
      url: '',
    });
  }
  protected onUpdate(updateresult: userAction.UpdateResult) {
    this.setState({
      name: updateresult.name,
      profile: updateresult.profile,
      icon: updateresult.icon,
      url: updateresult.url,
    });
  }
}
export default new SessionStore();
