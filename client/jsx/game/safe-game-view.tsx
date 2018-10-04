//iframeでゲームを表示するやつ
import * as React from 'react';

import { Game, Session } from '../data';
export interface IPropSafeGameView {
  game: Game;
  config: any;
  session: Session;
  audio_enabled?: boolean;
}
export interface IStateSafeGameView {
  confirm: boolean;
  initial_audio_enabled: boolean;
}

export default class SafeGameView extends React.PureComponent<
  IPropSafeGameView,
  IStateSafeGameView
> {
  constructor(props: IPropSafeGameView) {
    super(props);
    this.state = {
      confirm: false,
      initial_audio_enabled: true,
    };
  }
  componentWillReceiveProps(nextProps: IPropSafeGameView) {
    if (this.props.game !== nextProps.game) {
      //ゲームが変わったら再度確認
      this.setState({
        confirm: false,
      });
    }
  }
  componentDidUpdate(prevProps: IPropSafeGameView) {
    if (
      prevProps.audio_enabled !== this.props.audio_enabled &&
      this.state.confirm === true
    ) {
      //音声の有無が変わったからゲームに通知しないと
      this.setAudio(!!this.props.audio_enabled);
    }
  }
  protected setAudio(audio_enabled: boolean) {
    const iframe = this.refs.frame as HTMLIFrameElement;
    const w = iframe.contentWindow;
    if (w == null) {
      return;
    }
    //音声のあれの指令を出す
    w.postMessage(
      {
        message: 'audio_enabled',
        audio_enabled,
      },
      '*',
    );
    console.log('yes, audio', audio_enabled);
  }
  render() {
    const {
      props: { game, config, audio_enabled },
      state: { confirm, initial_audio_enabled },
    } = this;
    let content;
    if (confirm) {
      //了承済
      const au = initial_audio_enabled ? '?audio_enabled' : '';
      content = (
        <iframe
          ref="frame"
          className="game-safe-view"
          sandbox="allow-scripts"
          src={`//${config.service.sandboxDomain}/sandbox/${game.id}${au}`}
          width="512"
          height="356"
        />
      );
    } else {
      //警告を表示
      const handleClick = () => {
        this.setState({
          confirm: true,
          initial_audio_enabled: !!audio_enabled,
        });
      };
      content = (
        <div className="game-safe-view-confirm" onClick={handleClick}>
          <p>
            <span className="icon icon-warning" />
            JavaScript拡張がある正男です。
          </p>
          <p>
            JavaScriptが実行されると、ブラウザや端末に負荷をかけたり、脆弱性を持つウェブサービスを攻撃されたりする恐れがあります。
          </p>
          <p>この正男の作者を信頼できない場合、正男を表示しないでください。</p>
          <div className="game-safe-view-confirm-button">正男を表示</div>
        </div>
      );
    }
    return <div className="game-view">{content}</div>;
  }
}
