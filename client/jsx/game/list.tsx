import * as React from 'react';

import QueryList from './parts/query-list';

export interface IPropGameList {
  // 検索条件
  owner: string;
  tag: string;
}
export default class GameList extends React.Component<IPropGameList, {}> {
  render() {
    const { owner, tag } = this.props;
    const queryobj = {
      owner,
      tag,
    };
    return (
      <section>
        <h1>検索結果</h1>
        <QueryList query={queryobj} />
      </section>
    );
  }
}
