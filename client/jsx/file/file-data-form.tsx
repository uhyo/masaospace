import * as React from 'react';

import {
    getValue,
} from '../../scripts/react-util';

import {
    masao,
    ResourceKind,
} from '../data';
const {
    resourceKinds,
} = masao;

export interface IPropFileDataForm{
    config: any;
    // 送信ボタンの文字列
    submitButton: string;
    submitDisabled?: boolean;
    // プレビュー用のURL
    previewURL?: string
    previewLink?: string;
    // 最初のファイルデータ
    defaultFile?: {
        type: string;
        name: string;
        usage: string;
        description: string;
    };
    onSubmit?(file: {
        type: string;
        name: string;
        usage: string;
        description: string;
    }): void;
}
export interface IStateFileDataForm{
    type: string;
    name: string;
    usage: string;
    description: string;
}
export default class FileDataForm extends React.Component<IPropFileDataForm, IStateFileDataForm>{
    constructor(props: IPropFileDataForm){
        super(props);

        this.state = this.getStateFromProps(props);

        this.handleSubmit = this.handleSubmit.bind(this);
    }
    componentWillReceiveProps(nextProps: IPropFileDataForm){
        if(this.props !== nextProps){
            this.setState(this.getStateFromProps(nextProps));
        }
    }
    protected getStateFromProps(props: IPropFileDataForm): IStateFileDataForm{
        const f = props.defaultFile;
        if(f){
            return {
                type: f.type,
                name: f.name,
                usage: f.usage,
                description: f.description,
            };
        }else{
            return {
                type: '',
                name: '',
                usage: '',
                description: '',
            };
        }
    }
    render(){
        const {
            submitDisabled,
            submitButton,
            previewURL,
            previewLink,
            defaultFile,
        } = this.props;
        //ファイルの情報をアレする
        const usages=Object.keys(resourceKinds).map((key: ResourceKind)=> [key, resourceKinds[key]]);
        const config=this.props.config.filedata;
        //プレビュー
        let preview = null;
        if(previewURL != null){
            if(previewLink != null){
                preview=<div className="file-upload-preview">
                    <p>プレビュー</p>
                    <div>
                        <a href={previewLink} rel="external" target="_blank">
                            <img src={previewURL} />
                        </a>
                    </div>
                </div>;
            }else{
                preview=<div className="file-upload-preview">
                    <p>プレビュー</p>
                    <div>
                        <img src={previewURL} />
                    </div>
                </div>;
            }
        }

        return <div className="file-upload-data">
            {preview}
            <form className="form" onSubmit={this.handleSubmit}>
                <p>
                    <label className="form-row">
                        <span>ファイル名</span>
                        <input type="text" ref="name" required maxLength={config.name.maxLength} defaultValue={defaultFile ? defaultFile.name : ''} />
                    </label>
                </p>
                <p>
                    <label className="form-row">
                        <span>種類</span>
                        <input type="text" ref="type" readOnly value={defaultFile ? defaultFile.type : ''} />
                    </label>
                </p>
                <p>
                    <label className="form-row">
                        <span>用途</span>
                        <select ref="usage">
                            {
                                usages.map(([value,name])=>{
                                    const checked = defaultFile ? defaultFile.usage === value : false;
                                    return <option key={value} value={value} defaultChecked={checked}>{name}</option>;
                                })
                            }
                        </select>
                    </label>
                </p>
                <p>
                    <label className="form-row">
                        <span>説明</span>
                        <textarea ref="description" required maxLength={config.description.maxLength} defaultValue={defaultFile ? defaultFile.description : ''} />
                    </label>
                </p>
                <p>
                    <input className="form-single form-button" type="submit" disabled={submitDisabled} value={submitButton} />
                </p>
            </form>
        </div>;
    }
    handleSubmit(e: React.SyntheticEvent<HTMLFormElement>){
        const {
            onSubmit,
        } = this.props;
        e.preventDefault();
        if(onSubmit){
            onSubmit({
                type: getValue(this, 'type'),
                name: getValue(this, 'name'),
                usage: getValue(this, 'usage'),
                description: getValue(this, 'description'),
            });
        }
    }
}
