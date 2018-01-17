import * as React from 'react';
import * as bytes from 'bytes';
//file list
import {
    getValue,
} from '../../scripts/react-util';

import api from '../../actions/api';

import errorStore from '../../stores/error';

import {
    masao,
    ResourceKind,
} from '../data';
const {
    resourceKinds,
} = masao;

import Loading from '../commons/loading';
import FileUpload from './file-upload';

import {
    File,
} from '../data';

export interface IPropFileList{
    config: any;
    query: {
        owner?: string;
        usage?: ResourceKind;
    };
    currentFile?: File | string;
    onChange?(file: File | null): void;
    forceLoad?: boolean;
    //「デフォルトの画像を使用する」を選択できるかどうか
    useDefault?: boolean;
    //合計容量を表示するかどうか
    diskSpace?: boolean;
    //プレビューリンクを表示するかどうか
    usePreviewLink?: boolean;
}
export interface IStateFileList{
    query: {
        owner?: string;
        usage?: ResourceKind;
    };
    loading: boolean;
    files: Array<File>;
    file_upload: boolean;
}

export default class FileList extends React.Component<IPropFileList, IStateFileList>{
    constructor(props: IPropFileList){
        super(props);

        this.state = {
            query: props.query,
            loading: true,
            files: [],
            file_upload: false,
        };
    }
    componentDidMount(){
        this.load();
    }
    componentWillReceiveProps(nextProps: IPropFileList){
        //検索条件が違うときだけ再読み込み
        const oldQuery = this.props.query;
        const newQuery = nextProps.query;

        if(nextProps.forceLoad===true || oldQuery.owner !== newQuery.owner || oldQuery.usage !== newQuery.usage){
            this.setState({
                file_upload: false,
                query: newQuery,
            }, ()=>{
                this.load();
            });
        }else if (nextProps.currentFile != null){
            this.setState({
                file_upload: false,
            });
        }
    }
    protected load(cb?: ()=>void){
        const {
            query,
        } = this.state;
        if(query.owner==null){
            //あれ？（未登録ユーザー）
            this.setState({
                loading: false,
                files: [],
            });
            if (cb){
                setTimeout(cb,0);
            }
            return;
        }
        this.setState({
            loading: true,
        });
        api("/api/file/list", query)
        .then(({files})=>{
            //filesがきた
            this.setState({
                loading: false,
                files: files,
            });
            if(cb){
                cb();
            }
        })
        .catch(errorStore.emit);
    }
    render(){
        const {
            props: {
                currentFile,
                useDefault,
                diskSpace,
                usePreviewLink,
                onChange,
            },
            state: {
                query,
                loading,
                file_upload,
                files,
            },
        } = this;
        if(loading === true){
            return <Loading />;
        }
        let current: string;
        if(file_upload === true){
            current="file";
        }else if(!currentFile){
            current="default";
        }else if("string"===typeof currentFile){
            current=currentFile;
        }else{
            //FIXME
            current=currentFile.id;
        }
        const additional: Array<'default' | 'file' | File> = ["file"];
        if(useDefault === true){
            //デフォルト("")あり
            additional.unshift("default");
        }
        let diskInfo = null;
        if(diskSpace === true){
            //容量計算あり
            let disk = 0;
            for(let i=0; i < files.length; i++){
                disk += files[i].size;
            }
            diskInfo = <div className="file-list-info">
                <p>使用中: {bytes.format(disk)} / {bytes.format(this.props.config.filedata.diskSpace)}</p>
            </div>;
        }

        const handleSelectQuery = ()=>{
            const usage = (getValue(this, 'usage') as ResourceKind) || undefined;
            if (this.state.query.usage !== usage){
                this.setState({
                    query: {
                        ...query,
                        usage,
                    },
                }, ()=>{
                    this.load();
                });
            }
        };
        return <section className="file-list-container">
            <h1 className="legend">ファイルリスト</h1>
            <p className="file-list-query">
                検索条件：<select ref="usage" onChange={handleSelectQuery} value={this.state.query.usage}>
                    <option value="">全て</option>
                    {
                        Object.keys(resourceKinds).map((key: ResourceKind)=>{
                            return <option value={key} key={key}>{resourceKinds[key]}</option>;
                        })
                    }
                </select>
            </p>
            {diskInfo}
            <div className="file-list-main">{
                additional.concat(files).map((file,i)=>{
                    let className = "file-list-file";
                    if(file === "default"){
                        //デフォルトを使用するボタん
                        className+=" file-list-command file-list-default";
                        if(current==="default"){
                            className+=" file-list-current";
                        }
                        const handleClick = ()=>{
                            if (onChange){
                                onChange(null);
                            }
                        };
                        return <div key={i} className={className} onClick={handleClick}>デフォルトの画像を使用する</div>;
                    }else if(file==="file"){
                        //ファイルアップロード
                        className+=" file-list-command";
                        if(current==="file"){
                            className+=" file-list-current";
                        }
                        const handleClick = ()=>{
                            if (onChange){
                                // 新しいファイルボタンを押したので既存のファイルは無くす
                                onChange(null);
                            }
                            this.setState({
                                file_upload: true,
                            });
                        };
                        return <div key={i} className={className} onClick={handleClick}>
                            <div>
                                <span className="icon icon-fileplus" />
                            </div>
                            <div>新しいファイルを追加...</div>
                        </div>;
                    }else{
                        //ファイル
                        if(current === file.id){
                            className+=" file-list-current";
                        }
                        const handleClick = ()=>{
                            if (onChange){
                                onChange(file);
                            }
                        };
                        const previewLink = usePreviewLink===true ?
                            <p className="file-list-file-preview-link">
                                <a href={`/uploaded/${file.id}`} className="external" target="_blank">プレビュー</a>
                            </p>
                            : null;

                        return <div key={i} className={className} onClick={handleClick}>
                            <div className="file-list-file-name">{file.name}</div>
                            <p className="file-list-file-description">{file.description}</p>
                            {previewLink}
                        </div>;
                    }
                })
            }</div>
            { this.state.file_upload ? this.fileUpload() : null}
        </section>;
    }
    protected fileUpload(){
        //ファイルアップロード部分
        return <FileUpload config={this.props.config} onUpload={this.handleFileUpload.bind(this)} usage={this.state.query.usage || Object.keys(resourceKinds)[0]} />;
    }
    protected handleFileUpload(fileid: string){
        this.load(()=>{
            //該当ファイルを探す
            const {
                props: {
                    onChange,
                },
                state: {
                    files,
                },
            } = this;
            if (onChange == null){
                return;
            }
            for(var i=0; i < files.length; i++){
                if(files[i].id===fileid){
                    onChange(files[i]);
                    return;
                }
            }
            //せっかくアップロードしたのに該当ファイルがない？
            onChange(null);
        });
    }
}

