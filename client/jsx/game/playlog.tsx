import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Game, GameOpenMetadata } from '../data';
import * as React from 'react';
import GameView from './game-view';
import api from '../../actions/api';
import errorStore from '../../stores/error';

export interface IPropPlaylog {
  game: Game;
  metadata: GameOpenMetadata;
  playlogId: string;
}

export const PlaylogPage: React.FC<IPropPlaylog> = ({
  game,
  metadata,
  playlogId,
}) => {
  const [playlog, setPlaylog] = React.useState<ArrayBuffer | undefined>();
  const [status, setStatus] = React.useState<'init' | 'playing' | 'paused'>(
    'init',
  );

  React.useEffect(() => {
    api('/api/playlog/get', { id: playlogId }, void 0, true)
      .then(setPlaylog)
      .catch(errorStore.emit);
  }, []);

  const onControlClick = () => {
    if (playlog) {
      setStatus(current => (current === 'playing' ? 'paused' : 'playing'));
    }
  };

  console.log(game, metadata);
  if (game.script != null) {
    return <div>この正男はプレイログを再生できません。</div>;
  }
  return (
    <div className="game-playlog-wrapper">
      <div className="game-playlog-game">
        <GameView
          game={game}
          audio_enabled
          playlog={status === 'init' ? undefined : playlog}
        />
      </div>
      <div className="game-playlog-controls">
        <div className="game-playlog-centered" onClick={onControlClick}>
          {!playlog ? (
            <FontAwesomeIcon icon="spinner" size="4x" pulse />
          ) : status !== 'playing' ? (
            <FontAwesomeIcon icon={['far', 'play-circle']} size="4x" />
          ) : null}
        </div>
      </div>
    </div>
  );
};
