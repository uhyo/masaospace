import * as React from 'react';

import GameTile from './game-tile';

import { GameOpenMetadataWithOwnerData } from '../../data';

export interface IPropGameList {
  games: Array<GameOpenMetadataWithOwnerData>;
  zero?: string;
}
export default class GameList extends React.Component<IPropGameList, {}> {
  render() {
    const { games, zero } = this.props;
    const len = games.length;
    if (len === 0) {
      return (
        <div className="game-list">
          <p>{zero || '正男が見つかりませんでした。'}</p>
        </div>
      );
    }
    return (
      <div className="game-list">
        {games.map(obj => {
          return <GameTile key={obj.id} metadata={obj} />;
        })}
      </div>
    );
  }
}
