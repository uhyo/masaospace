import * as React from 'react';

import api from '../../../actions/api';
import Loading from '../../commons/loading';
import Pager from '../../commons/pager';
import GameList from './game-list';

import { GameOpenMetadataWithOwnerData } from '../../data';

export interface IPropQueryList {
  query: {
    owner?: string;
    tag?: string;
  };
  limit?: number;
}
export interface IStateQueryList {
  loading: boolean;
  page: number;
  games: Array<GameOpenMetadataWithOwnerData>;
}
export default class QueryList extends React.Component<
  IPropQueryList,
  IStateQueryList
> {
  constructor(props: IPropQueryList) {
    super(props);
    this.state = {
      loading: true,
      page: 0,
      games: [],
    };
  }
  componentDidMount() {
    this.fetch(this.state.page);
  }
  render() {
    const {
      props: { limit },
      state: { games, loading, page },
    } = this;
    if (loading) {
      //ローディング状態
      return <Loading />;
    }
    // pagerに渡す最大ページ番号
    const max =
      limit == null ? page + 1 : games.length < limit ? page + 1 : undefined;
    // ページ番号が移った
    const pageChange = (page: number) => {
      this.fetch(page - 1);
    };

    return (
      <div>
        <GameList games={games} zero="正男が見つかりませんでした。" />
        <Pager current={page + 1} min={1} max={max} onChange={pageChange} />
      </div>
    );
  }
  /**
   * Fetch a game list.
   * Also it can change the current page.
   */
  protected fetch(page: number): void {
    const {
      props: { query, limit },
    } = this;
    const lim = limit || 30;
    api('/api/game/find', {
      owner: query.owner,
      tag: query.tag,
      skip: page * lim,
      limit: lim,
    }).then(result => {
      this.setState({
        loading: false,
        page,
        games: result.metadatas,
      });
    });
  }
}
