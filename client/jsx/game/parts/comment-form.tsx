import * as React from 'react';

const base64ArrayBuffer = require('base64-arraybuffer');

import api from '../../../actions/api';
import errorStore from '../../../stores/error';

import {
    getValue,
} from '../../../scripts/react-util';

export interface IPropCommentForm{
    game: number;
    config: any;
    playlog?: ArrayBuffer;
    onComment?(): void;
}
export default class CommentForm extends React.Component<IPropCommentForm, {}>{
    protected handleSubmit(e: React.SyntheticEvent<HTMLFormElement>){
        const {
            props: {
                game,
                playlog,
                onComment,
            },
        } = this;
        e.preventDefault();
        api("/api/comment/new", {
            game,
            comment: getValue(this, 'comment'),
            playlog: playlog && base64ArrayBuffer.encode(playlog),
        })
        .then(()=>{
            if(onComment){
                onComment();
            }
        })
        .catch(errorStore.emit);
        //フォームを初期化
        (this.refs.comment as HTMLInputElement).value = '';
    }
    render(){
        //コメント投稿フォーム
        return <form className="form" onSubmit={this.handleSubmit.bind(this)}>
            <p>
                <label className="form-row">
                    <textarea ref="comment" className="form-single" required maxLength={this.props.config.comment.maxLength} />
                </label>
            </p>
            <p>
                <input type="submit" className="form-single form-button" value="コメントを投稿する" />
            </p>
        </form>;
    }
}
