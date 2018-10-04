import * as React from 'react';
//masao edit component

import errorStore from '../../stores/error';
import MasaoSelector from './masao-selector';
import GameMetadataForm from './game-metadata-form';
import NeedLogin from '../commons/need-login';
import HorizontalMenu from '../commons/horizontal-menu';
import FileList from '../file/file-list';

import {
  masao,
  File,
  Session,
  GameEditableMetadata,
  Resource,
  MasaoJSONFormat,
} from '../data';
//とりあえずよく使うやつ
const major = [
  'filename_pattern',
  'filename_title',
  'filename_ending',
  'filename_gameover',
  'filename_haikei',
  'filename_mapchip',
];

interface IPropMasaoEdit {
  config: any;
  session: Session;
  game?: MasaoJSONFormat;
  metadata?: GameEditableMetadata;
  resources?: Array<Resource>;
  saveButton: string;
  editorId: string;
  onSave(obj: {
    game: masao.format.MasaoJSONFormat;
    metadata: GameEditableMetadata;
    resources: Array<Resource>;
  }): void;
}
interface IStateMasaoEdit {
  game: MasaoJSONFormat | undefined;
  metadata: GameEditableMetadata;
  resources: Array<Resource>;

  filesPage: string;
  filesPage2: string | null;
}
export default class MasaoEdit extends React.Component<
  IPropMasaoEdit,
  IStateMasaoEdit
> {
  constructor(props: IPropMasaoEdit) {
    super(props);
    this.state = {
      game: this.props.game || void 0,
      metadata: this.props.metadata || {
        title: '',
        description: '',
        tags: [],
        hidden: false,
      },

      resources: this.props.resources || [],

      filesPage: 'filename_pattern',
      filesPage2: null, //otherのとき
    };
  }
  protected masaoSelected(
    game: MasaoJSONFormat,
    metadata: GameEditableMetadata,
  ) {
    const { metadata: m } = this.state;

    let metadata_title;
    if (metadata == null) {
      metadata_title = {};
    } else {
      metadata_title = {
        title: metadata.title,
      };
    }
    this.setState({
      game,
      metadata: {
        ...m,
        ...metadata_title,
      },
    });
  }
  protected handleMetadata(metadata: GameEditableMetadata) {
    this.setState({
      metadata: {
        ...this.state.metadata,
        ...metadata,
      },
    });
  }
  protected handleSubmit(e: React.SyntheticEvent<HTMLElement>) {
    e.preventDefault();
    // XXX Fluxの敗北
    const selector = this.refs.selector as MasaoSelector;
    const game = selector.requestCurrentGame() || this.state.game;
    if (game == null) {
      errorStore.emit('ゲームを選択してください。');
      return;
    }
    this.props.onSave({
      game,
      metadata: this.state.metadata,
      resources: this.state.resources,
    });
  }
  render() {
    const { editorId } = this.props;
    const { game, resources } = this.state;
    return (
      <div>
        <MasaoSelector
          ref="selector"
          resources={resources}
          onSelect={this.masaoSelected.bind(this)}
          editorId={editorId}
          defaultGame={game}
        />
        {this.files()}
        {this.form()}
      </div>
    );
  }
  files() {
    const {
      props: { config, session },
      state: { filesPage, filesPage2, resources },
    } = this;
    const contents = major
      .map(key => {
        return {
          id: key,
          name: masao.resources[key],
        };
      })
      .concat({
        id: '_other',
        name: 'その他',
      });
    //どのリソースを変更するか？
    const paramType =
      filesPage === '_other' ? filesPage2 || 'filename_chizu' : filesPage;

    const query = {
      owner: session.user,
      usage: masao.resourceToKind[paramType],
    };

    //今どのファイルが選択されているか調べる
    let fileValue: string | undefined = void 0;
    for (let i = 0; i < resources.length; i++) {
      if (resources[i].target === paramType) {
        fileValue = resources[i].id;
        break;
      }
    }

    //その他の場合のサブメニュー
    let submenu = null;
    if (filesPage === '_other') {
      const handleChange = (e: React.SyntheticEvent<HTMLSelectElement>) => {
        this.setState({
          filesPage2: e.currentTarget.value,
        });
      };
      submenu = (
        <form className="form">
          <p className="form-row">
            <select
              className="form-single"
              onChange={handleChange}
              value={filesPage2 || void 0}
            >
              {Object.keys(masao.resources).map(key => {
                return (
                  <option key={key} value={key}>{`${key} ${
                    masao.resources[key]
                  }`}</option>
                );
              })}
            </select>
          </p>
        </form>
      );
    }

    const handlePageChange = (page: string) => {
      this.setState({
        filesPage: page,
      });
    };
    return (
      <section className="game-files">
        <h1>ファイル選択</h1>
        <HorizontalMenu
          contents={contents}
          page={filesPage}
          onChange={handlePageChange}
        />
        {submenu}
        <FileList
          config={config}
          query={query}
          useDefault
          usePreviewLink
          currentFile={fileValue}
          onChange={this.fileHandler(paramType)}
        />
      </section>
    );
  }
  protected form() {
    const {
      props: { session, saveButton },
      state: { metadata },
    } = this;
    //正男メタデータを入力するフォーム
    const m: Partial<GameEditableMetadata> = metadata || {};
    let submit = null;
    if (session.user == null) {
      submit = (
        <NeedLogin>
          <p>正男を投稿するにはログインが必要です。</p>
          <p>ページ上部からログインしても作った正男は失われません。</p>
          <p>
            アカウントをお持ちではありませんか？
            <a href="/entry/page" target="_blank">
              新規登録
            </a>
            を行ってください。
          </p>
        </NeedLogin>
      );
    } else {
      submit = (
        <form className="form">
          <p>
            <input
              className="form-single form-button"
              type="button"
              value={saveButton}
              disabled={this.isSubmitDisabled()}
              onClick={this.handleSubmit.bind(this)}
            />
          </p>
        </form>
      );
    }
    return (
      <div>
        <section className="game-metadata-form">
          <h1>正男情報</h1>
          <div className="game-new-metadataform-wrapper">
            <GameMetadataForm
              onChange={this.handleMetadata.bind(this)}
              title={m.title || ''}
              description={m.description || ''}
              tags={m.tags || []}
              hidden={!!m.hidden}
            />
            {submit}
          </div>
        </section>
      </div>
    );
  }
  //入力が完了してたら送信できる
  isSubmitDisabled() {
    const { metadata } = this.state;
    if (metadata == null) {
      return true;
    }

    if (metadata.title && metadata.description) {
      return false;
    }
    return true;
  }
  //ファイルが替わった
  protected fileHandler(param: string) {
    return (file: File | null) => {
      //ゲームがかきかわる
      const { game } = this.state;
      const resources = [...this.state.resources];
      let flag = false;
      if (!file) {
        //リソースを削除
        for (let i = 0; i < resources.length; i++) {
          if (resources[i].target === param) {
            resources.splice(i, 1);
            i--;
          }
        }
      } else {
        //リソースを追加
        for (let i = 0; i < resources.length; i++) {
          if (resources[i].target === param) {
            //すでにあったので置き換え
            resources[i] = {
              ...resources[i],
              id: file.id,
            };
            flag = true;
            break;
          }
        }
        if (flag === false) {
          //なかったので追加する
          resources.push({
            target: param,
            id: file.id,
          });
        }
      }
      //これが新しいゲームだ
      const newGame =
        game == null
          ? void 0
          : {
              ...game,
              resources,
            };
      this.setState({
        game: newGame,
        resources,
      });
    };
  }
}
