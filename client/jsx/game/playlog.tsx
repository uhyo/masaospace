import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Game, GameOpenMetadata } from '../data';
import * as React from 'react';
import GameView from './game-view';
import { loadPlaylog } from './logic/loadPlaylog';

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
  const [audio, setAudio] = React.useState(true);
  const gameRef = React.useRef<any>();

  React.useEffect(() => {
    loadPlaylog(playlogId).then(setPlaylog);
  }, []);

  const onGetGame = React.useCallback((game: any) => {
    gameRef.current = game;
  }, []);

  const onControlClick = () => {
    if (playlog) {
      if (status === 'playing') {
        if (gameRef.current) {
          setStatus('paused');
          gameRef.current.loopInstance.stop();
        }
      } else {
        setStatus('playing');
        gameRef.current?.loopInstance.resume();
      }
    }
  };

  const onRestart = () => {
    if (gameRef.current && status !== 'init') {
      // hacky; make a new playlog to re-create Game
      setPlaylog(playlog?.slice(0));
      setStatus('playing');
    }
  };

  const toggleAudio = () => {
    setAudio(current => !current);
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
          audio_enabled={audio}
          playlog={status === 'init' ? undefined : playlog}
          onGetGame={onGetGame}
        />
      </div>
      <div
        className={
          'game-playlog-controls' +
          (status === 'paused' ? ' game-playlog-controls-paused' : '')
        }
      >
        <div className="game-playlog-centered" onClick={onControlClick}>
          {!playlog ? (
            <FontAwesomeIcon icon="spinner" size="4x" pulse />
          ) : status !== 'playing' ? (
            <FontAwesomeIcon icon={['far', 'play-circle']} size="4x" />
          ) : null}
        </div>
        <div className="game-playlog-bottom-controls">
          <div>
            <button
              className="game-playlog-bottom-control-icon"
              onClick={onRestart}
            >
              <FontAwesomeIcon icon="redo-alt" size="2x" />
            </button>
          </div>
          <div>
            <button
              className="game-playlog-bottom-control-icon"
              onClick={toggleAudio}
            >
              <FontAwesomeIcon
                icon={audio ? 'volume-up' : 'volume-mute'}
                size="2x"
              />
            </button>
            <a
              className="game-playlog-bottom-control-icon"
              href={`/play/${metadata.id}`}
              target="_blank"
            >
              <FontAwesomeIcon icon="gamepad" size="2x" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
