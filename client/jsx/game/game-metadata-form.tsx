//メタデータフォーム
import * as React from 'react';

import StrList from '../commons/form-strlist';

import { GameEditableMetadata } from '../data';

import { getValue } from '../../scripts/react-util';

export interface IPropGameMetadataForm {
  title: string;
  description: string;
  tags: Array<string>;
  hidden: boolean;
  onChange?(metadata: GameEditableMetadata): void;
}
export interface IStateGameMetadataForm {
  tags: Array<string>;
}
export default class GameMetadataForm extends React.Component<
  IPropGameMetadataForm,
  IStateGameMetadataForm
> {
  constructor(props: IPropGameMetadataForm) {
    super(props);
    this.state = {
      tags: props.tags,
    };
  }
  componentWillReceiveProps(nextProps: IPropGameMetadataForm) {
    this.setState({
      tags: nextProps.tags || this.state.tags,
    });
  }
  protected handleChange() {
    this.changeEvent();
  }
  protected handleTags(tags: Array<string>) {
    console.log('tags!', tags);
    this.setState(
      {
        tags,
      },
      () => {
        this.changeEvent();
      },
    );
  }
  protected changeEvent() {
    const { onChange } = this.props;
    if ('function' === typeof onChange) {
      onChange({
        title: getValue(this, 'title'),
        description: getValue(this, 'description'),
        tags: this.state.tags,
        hidden: getValue(this, 'hidden') === 'true',
      });
    }
  }
  render() {
    const { title, description, hidden } = this.props;
    const handleSubmit = (e: React.SyntheticEvent<HTMLElement>) => {
      e.preventDefault();
    };
    const handleChange = this.handleChange.bind(this);
    return (
      <form className="form" onSubmit={handleSubmit}>
        <p>
          <label className="form-row">
            <span>タイトル</span>
            <input
              type="text"
              ref="title"
              onChange={handleChange}
              defaultValue={title}
            />
          </label>
        </p>
        <p>
          <label className="form-row">
            <span>説明</span>
            <textarea
              ref="description"
              onChange={handleChange}
              value={description}
            />
          </label>
        </p>
        <div>
          <span className="form-row">
            <span>タグ</span>
            <StrList
              value={this.state.tags}
              onChange={this.handleTags.bind(this)}
            />
          </span>
        </div>
        <p>
          <label className="form-row">
            <span>非公開</span>
            <select ref="hidden" value={String(hidden)} onChange={handleChange}>
              <option value="false">非公開にしない</option>
              <option value="true">非公開にする</option>
            </select>
          </label>
        </p>
      </form>
    );
  }
}
