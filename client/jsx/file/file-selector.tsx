import * as React from 'react';
const bytes = require('bytes');

import { selectFile } from '../../scripts/file';

export interface IPropFileSelect {
  accept?: string;
  onSelect?(file: File | null): void;
  maxsize?: number;
}
export interface IStateFileSelect {
  file: File | null;
}
export default class FileSelect extends React.Component<
  IPropFileSelect,
  IStateFileSelect
> {
  constructor(props: IPropFileSelect) {
    super(props);

    this.state = {
      file: null,
    };
  }
  render() {
    let inn;
    if (this.state.file) {
      inn = this.acceptedView(this.state.file);
    } else {
      inn = this.acceptingView();
    }
    const handleDragEnter = (e: React.SyntheticEvent<HTMLDivElement>) => {
      e.preventDefault();
    };
    return (
      <div className="fileselector">
        <div
          className="fileselector-dragarea"
          onDragEnter={handleDragEnter}
          onDragOver={this.handleDragOver}
          onDrop={this.handleDrop.bind(this)}
        >
          {inn}
        </div>
      </div>
    );
  }
  handleDragOver(e: React.DragEvent<HTMLElement>) {
    e.preventDefault();
    const ts = e.dataTransfer.types;
    let flg = false;
    for (let i = 0; i < ts.length; i++) {
      if (ts[i] === 'Files') {
        flg = true;
        break;
      }
    }
    if (flg === false) {
      //ファイルがきてないよ
      e.dataTransfer.dropEffect = 'none';
    } else {
      e.dataTransfer.dropEffect = 'copy';
    }
  }
  handleDrop(e: React.DragEvent<HTMLElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file == null) {
      return;
    }
    this.setState({
      file,
    });
    if ('function' === typeof this.props.onSelect) {
      this.props.onSelect(file);
    }
  }
  protected acceptedView(file: File) {
    const {
      props: { maxsize },
    } = this;

    const { name, size } = file;
    let sizewarn = null;
    if (maxsize != null && size > maxsize) {
      //オーバーしてる
      sizewarn = (
        <p className="warning-string">
          ファイルサイズがアップロード可能なサイズを超えています。
        </p>
      );
    }
    return (
      <div>
        <p>
          ファイル：
          {name}
        </p>
        {sizewarn}
        <p>
          <span
            className="clickable"
            onClick={this.handleFileSelect.bind(this)}
          >
            ファイルを選択...
          </span>
        </p>
      </div>
    );
  }
  protected acceptingView() {
    let accepts = null,
      limits = null;
    const { accept, maxsize } = this.props;
    if (accept) {
      accepts =
        accept
          .split(',')
          .map(ext => {
            return `${ext.trim()}ファイル`;
          })
          .join(', ') + 'を読み込めます。';
    }
    if (maxsize != null) {
      //最大サイズが指定されている
      limits = `アップロードできるファイルのサイズは最大${bytes(
        maxsize,
      )}です。`;
    }
    return (
      <div>
        <p>ここにファイルをドラッグしてください。</p>
        {accepts || limits ? (
          <p className="fileselector-accept">
            {accepts}
            {limits}
          </p>
        ) : null}
        <p>
          <span
            className="clickable"
            onClick={this.handleFileSelect.bind(this)}
          >
            ファイルを選択...
          </span>
        </p>
      </div>
    );
  }
  protected handleFileSelect(e: React.MouseEvent<HTMLElement>) {
    e.preventDefault();
    selectFile(f => {
      this.setState({
        file: f,
      });
      const { onSelect } = this.props;
      if ('function' === typeof onSelect) {
        onSelect(f);
      }
    });
  }
}
