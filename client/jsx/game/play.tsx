import * as React from 'react';

const queryString = require('query-string');
const scrollIntoView = require('dom-scroll-into-view');
import * as path from '../../scripts/path';

import GameView from './game-view';
import SafeGameView from './safe-game-view';
import UserTile from './parts/user-tile';
import Datetime from '../commons/datetime';
import RichText from '../commons/rich-text';
import GameComment from './parts/game-comment';
import PlaylogList from './parts/playlog-list';

import {
  Session,
  UserOpenDataWithId,
  Game,
  GameOpenMetadata,
  SeriesOfGame,
} from '../data';
import { loadPlaylog } from './logic/loadPlaylog';

export interface IPropPlay {
  game: Game;
  metadata: GameOpenMetadata;
  owner: UserOpenDataWithId;
  series: Array<SeriesOfGame>;
  defaultPlaylogId?: string;
  config: any;
  session: Session;
}
export interface IStatePlay {
  audio_switch: boolean;
  playlog_switch: boolean;
  // 保存したプレイログ
  playlog_score: any; //スコアがいちばん
  playlog_clear: any; //進みがいちばん
  // 今プレイ中のプレイログ
  playlog_playing_data: {
    playlogId?: string;
    buffer: ArrayBuffer;
  } | null;
}
export default class Play extends React.Component<IPropPlay, IStatePlay> {
  constructor(props: IPropPlay) {
    super(props);
    this.state = {
      audio_switch: true,
      playlog_switch: true,
      playlog_score: null,
      playlog_clear: null,
      playlog_playing_data: null,
    };

    this.handlePlaylog = this.handlePlaylog.bind(this);
  }
  componentDidMount() {
    const { defaultPlaylogId } = this.props;

    if (defaultPlaylogId) {
      loadPlaylog(defaultPlaylogId).then(buffer => {
        if (buffer) {
          this.setState({
            playlog_playing_data: {
              playlogId: defaultPlaylogId,
              buffer,
            },
          });
        }
      });
    }
  }

  render() {
    const {
      props: { config, game, metadata, series, session, owner },
      state: {
        audio_switch,
        playlog_switch,
        playlog_score,
        playlog_clear,
        playlog_playing_data,
      },
    } = this;
    let ownertools = null;
    if (session.user === metadata.owner) {
      //わたしがオーナーだ！
      ownertools = (
        <p>
          <a href={`/game/edit/${metadata.id}`}>
            <span className="icon icon-edit" />
            <span>正男を編集</span>
          </a>
        </p>
      );
    }
    let hiddenInfo = null;
    if (metadata.hidden === true) {
      hiddenInfo = <strong>（非公開）</strong>;
    }
    let tags = null;
    if (metadata.tags && metadata.tags.length > 0) {
      //タグがあった
      tags = (
        <div className="game-play-info-tags">
          <div>
            <span className="icon icon-tag" />
          </div>
          <ul>
            {metadata.tags.map((tag, i) => {
              return (
                <li key={i}>
                  <a href={path.gameListByTag(tag)}>{tag}</a>
                </li>
              );
            })}
          </ul>
        </div>
      );
    }
    let seriesArea = null;
    if (series.length > 0) {
      seriesArea = (
        <div className="game-play-info-series">
          {series.map(s => {
            let prev = null,
              next = null;
            if (s.prev != null) {
              prev = (
                <span>
                  <a href={`/play/${s.prev}`}>前の正男</a>
                </span>
              );
            }
            if (s.next != null) {
              next = (
                <span>
                  {prev != null ? '｜' : null}
                  <a href={`/play/${s.next}`}>次の正男</a>
                </span>
              );
            }
            return (
              <p key={s.id}>
                シリーズ:{' '}
                <b>
                  <a href={`/series/${s.id}`}>{s.name}</a>
                </b>
                &#x3000;
                {prev}
                {next}
              </p>
            );
          })}
        </div>
      );
    }

    //プレイログをとったら表示
    let playlogArea = null;
    //プレイログ
    const playlogs =
      playlog_score != null
        ? playlog_score !== playlog_clear
          ? [playlog_clear, playlog_score]
          : [playlog_score]
        : playlog_clear != null
        ? [playlog_clear]
        : [];
    if (playlogs.length > 0 || playlog_playing_data != null) {
      let stopper = null;
      if (playlog_playing_data != null) {
        const clickHandler = (e: React.SyntheticEvent<HTMLElement>) => {
          e.preventDefault();
          this.setState({
            playlog_playing_data: null,
          });
        };
        const twttrQ = queryString.stringify({
          url: `${config.service.url}play/${metadata.id}?playlog=${playlog_playing_data.playlogId}`,
          text: `「${metadata.title}」のプレイログ`,
        });
        stopper = (
          <p>
            プレイログ再生中{'　'}
            <span className="clickable" onClick={clickHandler}>
              再生を停止
            </span>
            {playlog_playing_data.playlogId ? (
              <>
                {'　'}
                プレイログを共有:
                <a
                  href={'https://twitter.com/share?' + twttrQ}
                  target="_blank"
                  title="Twitterでツイート"
                >
                  <span className="icon icon-twitter" />
                </a>
              </>
            ) : null}
          </p>
        );
      }
      let player = null;
      if (playlog_score != null || playlog_clear != null) {
        const plist =
          playlog_score != null
            ? playlog_score !== this.state.playlog_clear
              ? [playlog_clear, playlog_score]
              : [playlog_score]
            : playlog_clear != null
            ? [playlog_clear]
            : [];
        const handlePlay = (obj: any) => {
          this.handlePlay({
            buffer: obj.buffer,
          });
        };

        player = (
          <div>
            <p>保存されたプレイログ：</p>
            <PlaylogList playlogs={plist} onPlay={handlePlay} />
          </div>
        );
      }
      playlogArea = (
        <div className="game-play-logs">
          {stopper}
          {player}
        </div>
      );
    }
    //gameviewにわたすやつ
    let playlogCallback: undefined | ((obj: any) => void) = void 0;
    if (playlog_switch === true && playlog_playing_data == null) {
      playlogCallback = this.handlePlaylog;
    }
    //GameView
    let gameView;
    if (game.script == null) {
      //拡張JSがないものはsandboxに入れずに実行する
      //TODO jsファイルのやつは？
      gameView = (
        <GameView
          game={game}
          audio_enabled={audio_switch}
          playlogCallback={playlogCallback}
          playlog={playlog_playing_data?.buffer}
        />
      );
    } else {
      gameView = (
        <SafeGameView
          game={game}
          audio_enabled={audio_switch}
          config={this.props.config}
          session={session}
        />
      );
    }
    const handleAudioChange = (audio: boolean) => {
      this.setState({
        audio_switch: audio,
      });
    };
    const { screen_name, name, icon, url } = owner;
    return (
      <section>
        <h1>{metadata.title}</h1>
        <div className="game-play-container" ref="gamecontainer">
          {gameView}
        </div>
        {playlogArea}
        <div className="game-play-info">
          <div className="game-play-info-meta">
            <p>
              <Datetime date={new Date(metadata.created)} /> 投稿
            </p>
            <p>
              閲覧数 {metadata.playcount} {hiddenInfo}
            </p>
            {ownertools}
            <UserTile
              label="投稿者"
              screen_name={screen_name}
              name={name}
              icon={icon}
              url={url}
              fullWidth
            />
          </div>
          <div className="game-play-info-description">
            <div className="game-play-info-message">
              <RichText text={metadata.description} />
            </div>
            {tags}
            {seriesArea}
          </div>
        </div>
        <GameTools
          config={this.props.config}
          game={game}
          metadata={metadata}
          audio={audio_switch}
          onAudioChange={handleAudioChange}
        />
        <GameComment
          game={metadata.id}
          playlogs={playlogs}
          config={this.props.config}
          session={session}
          onPlay={this.handlePlay.bind(this)}
        />
      </section>
    );
  }
  //ゲームからplaylogが来たので
  protected handlePlaylog(obj: any) {
    let { playlog_clear, playlog_score } = this.state;
    let flag = false;
    console.log(playlog_clear, obj);
    if (
      playlog_clear == null ||
      (obj.cleared && !playlog_clear.cleared) ||
      obj.stage > playlog_clear.stage ||
      (obj.cleared === playlog_clear.cleared &&
        obj.stage === playlog_clear.stage &&
        obj.score > playlog_clear.score)
    ) {
      //更新
      playlog_clear = obj;
      flag = true;
    }
    if (playlog_score == null || playlog_score.score < obj.score) {
      playlog_score = obj;
      flag = true;
    }
    if (flag === true) {
      this.setState({
        playlog_score,
        playlog_clear,
      });
    }
  }
  //再生要求
  handlePlay(playlog: { playlogId?: string; buffer: ArrayBuffer }) {
    //表示する
    scrollIntoView(this.refs.gamecontainer, window, {
      onlyScrollIfNeeded: true,
    });
    this.setState({
      playlog_playing_data: playlog,
    });
  }
}

interface IPropGameTools {
  config: any;
  game: Game;
  metadata: GameOpenMetadata;
  audio: boolean;
  onAudioChange(audio: boolean): void;
}
interface IStateGameTools {
  code: boolean;
}
class GameTools extends React.Component<IPropGameTools, IStateGameTools> {
  constructor(props: IPropGameTools) {
    super(props);
    this.state = {
      code: false,
    };
  }
  render() {
    const {
      props: { config, metadata, game, audio, onAudioChange },
      state,
    } = this;
    let code = null;
    if (state.code === true) {
      code = (
        <div className="game-play-tools-code">
          <p>正男を埋め込みたい箇所に以下のHTMLコードを貼り付けてください。</p>
          <pre>
            <code>{`<iframe src="${config.service.url}embed/${metadata.id}" width="514" height="434" style="border:none"></iframe>`}</code>
          </pre>
        </div>
      );
    }
    //audio
    let au = null;
    if (
      (game.params.se_switch === '2' && game.params.fx_bgm_switch === '2') ||
      game.version !== 'fx'
    ) {
      //効果音はいらなそう
      au = <span className="icon icon-sound-off" title="音声はありません。" />;
    } else {
      //効果音がありそう
      const audioClick = () => {
        if (onAudioChange) {
          onAudioChange(!audio);
        }
      };
      if (audio === true) {
        au = (
          <span
            className="icon icon-sound clickable"
            title="音声がONになっています。"
            onClick={audioClick}
          />
        );
      } else {
        au = (
          <span
            className="icon icon-sound-off clickable"
            title="音声がOFFになっています。"
            onClick={audioClick}
          />
        );
      }
    }
    //social
    const url = config.service.url + 'play/' + metadata.id;
    const title = metadata.title + ' | ' + config.service.name;
    const twttrQ = queryString.stringify({
        url: url,
        text: title,
      }),
      facebookQ = queryString.stringify({
        u: url,
      }),
      googleQ = queryString.stringify({
        url: url,
      });
    const handleCode = () => {
      this.setState({
        code: !state.code,
      });
    };
    return (
      <div className="game-play-tools">
        <div className="game-play-tools-bar">
          <div className="game-play-tools-code-link">
            <a
              href={`/play/${metadata.id}`}
              className="nop"
              onClick={handleCode}
            >
              ウェブページに埋め込む...
            </a>
          </div>
          <div className="game-play-tools-audio">{au}</div>
          <div className="game-play-tools-social">
            <span className="game-play-tools-social-label">共有：</span>
            <a
              href={'https://twitter.com/share?' + twttrQ}
              target="_blank"
              title="Twitterでツイート"
            >
              <span className="icon icon-twitter" />
            </a>
            <a
              href={'https://www.facebook.com/sharer/sharer.php?' + facebookQ}
              target="_blank"
              title="Facebookでシェア"
            >
              <span className="icon icon-facebook" />
            </a>
            <a
              href={'https://plus.google.com/share?' + googleQ}
              target="_blank"
              title="Google+でシェア"
            >
              <span className="icon icon-googleplus" />
            </a>
          </div>
        </div>
        {code}
      </div>
    );
  }
  handleCode(e: React.SyntheticEvent<HTMLElement>) {
    e.preventDefault();
    this.setState({
      code: !this.state.code,
    });
  }
}
