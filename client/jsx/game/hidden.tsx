import * as React from 'react';

import * as pageActions from '../../actions/page';

import { Session } from '../data';
interface IPropGameHidden {
  id: number;
  owner: string;
  session: Session;
}
export default class GameHidden extends React.Component<IPropGameHidden, {}> {
  componentWillReceiveProps(nextProps: IPropGameHidden) {
    if (nextProps.session.user === nextProps.owner) {
      pageActions.load(`/play/${nextProps.id}`);
    }
  }
  render() {
    return <p>このゲームは非公開です。</p>;
  }
}
