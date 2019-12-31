import * as React from 'react';
//comments list

import { getApi } from '../../../actions/api';

import errorStore from '../../../stores/error';

import UserTile from './user-tile';
import Datetime from '../../commons/datetime';
import RichText from '../../commons/rich-text';

import { Comment } from '../../data';

export interface IPropComments {
  comments: Array<Comment>;
  onPlay(playlog: { playlogId: string; buffer: ArrayBuffer }): void;
}
export default class Comments extends React.Component<IPropComments, {}> {
  render() {
    const { comments } = this.props;
    if (comments.length === 0) {
      return (
        <div className="comments-comment-none">
          <p>コメントはまだありません。</p>
        </div>
      );
    }
    return (
      <div>
        {comments.map(obj => {
          let playlogArea = null;
          if (obj.playlog != null) {
            playlogArea = (
              <div className="comments-playlog">
                <p>
                  {obj.cleared === true ? (
                    <span className="comments-playlog-cleared">★</span>
                  ) : null}
                  スコア: {obj.score}
                  <span
                    className="clickable"
                    onClick={this.handlePlay(obj.playlog)}
                  >
                    再生
                  </span>
                </p>
                {obj.cleared !== true && obj.stage && obj.stage > 0 ? (
                  <p>
                    ステージ
                    {obj.stage}
                    までクリア
                  </p>
                ) : null}
                <p />
              </div>
            );
          }
          return (
            <div key={obj.id} className="comments-comment">
              <div className="comments-info">
                <UserTile
                  label="投稿者"
                  fullWidth
                  icon={obj.user.icon}
                  name={obj.user.name}
                  screen_name={obj.user.screen_name}
                />
                {playlogArea}
              </div>
              <div className="comments-body">
                <div className="comments-text">
                  <RichText text={obj.comment} />
                </div>
                <p className="comments-time">
                  <Datetime date={new Date(obj.time)} /> 投稿
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
  //プレイログを再生する関数を返す
  protected handlePlay(playlogId: string) {
    return (e: React.SyntheticEvent<HTMLElement>) => {
      e.preventDefault();
      //ログをもらう
      getApi(
        '/api/playlog/get',
        {
          id: playlogId,
        },
        true,
      )
        .then(buffer => {
          this.props.onPlay({
            playlogId,
            buffer,
          });
        })
        .catch(errorStore.emit);
    };
  }
}
