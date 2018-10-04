import * as React from 'react';

import { Playlog } from '../../data';
//プレイログの一覧を表示するぞ〜〜〜〜〜〜〜〜
export interface IPropPlaylogList {
  playlogs: Array<Playlog>;
  onPlay?(playlog: Playlog): void;
  playString?: string;
  selected?: number | null;
}
export default ({
  playlogs,
  onPlay,
  playString,
  selected,
}: IPropPlaylogList) => {
  return (
    <ul className="game-parts-playlog-list-list">
      {playlogs.map((obj, i) => {
        const clickHandler = (e: React.SyntheticEvent<HTMLElement>) => {
          e.preventDefault;
          if (onPlay) {
            onPlay(obj);
          }
        };
        let play = null;
        if (onPlay != null) {
          play = (
            <span className="clickable" onClick={clickHandler}>
              {playString || '再生'}
            </span>
          );
        }
        return (
          <li key={i}>
            {selected === i ? (
              <span className="game-parts-playlog-list-checked">✔</span>
            ) : null}{' '}
            {obj.cleared ? 'クリア' : '未クリア'}
            　スコア:
            {obj.score}
            　{play}
          </li>
        );
      })}
    </ul>
  );
};
