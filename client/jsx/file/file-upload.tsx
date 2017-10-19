import * as React from 'react';
const mime = require('mime');
//file upload form

import api from '../../actions/api';

import errorStore from '../../stores/error';

import FileSelector from './file-selector';
import FileDataForm from './file-data-form';

import {
    File as FileData,
} from '../data';

export interface IPropFileUpload{
    config: any;
    onUpload?(id: string): void;
    usage: string;
}
export interface IStateFileUpload{
    file: File | null;
    url: string | undefined;
    status: 'uploadable' | 'uploading' | 'uploaded' | null;
}
export default class FileUpload extends React.Component<IPropFileUpload, IStateFileUpload>{
    constructor(props: IPropFileUpload){
        super(props);

        this.state = {
            file: null,
            url: void 0,
            status: null,
        };
    }
    render(){
        const {
            file,
            status,
        } = this.state;
        let filedataArea;

        if (file != null && status != null){
            let disabled: boolean = false;
            let uploadtext: string = '';
            if(status==="uploadable"){
                disabled=false;
                uploadtext="アップロード";
            }else if(status==="uploading"){
                disabled=true;
                uploadtext="アップロード中";
            }else if(status==="uploaded"){
                disabled=true;
                uploadtext="アップロード完了";
            }
            const defaultData = {
                type: mime.getType(file.name),
                name: file.name,
                usage: this.props.usage,
                description: ""
            };
            filedataArea = <FileDataForm config={this.props.config} submitButton={uploadtext} submitDisabled={disabled} previewURL={this.state.url} defaultFile={defaultData} onSubmit={this.handleSubmit.bind(this)} />;
        }else{
            filedataArea = null;
        }

        return <section className="file-upload">
            <h3 className="legend">新しいファイルを追加</h3>
            <FileSelector onSelect={this.handleFile.bind(this)} maxsize={this.props.config.filedata.maxSize}/>
            {filedataArea}
        </section>;
    }
    protected handleFile(file: File){
        let url: string | undefined = void 0;
        if(/^image\//i.test(file.type)){
            //画像なのでプレビューしてみる
            url = URL.createObjectURL(file);
        }
        this.setState({
            file: file,
            url: url,
            status: "uploadable",
        });
    }
    protected handleSubmit(filedata: FileData){
        //ファイルをアップロードするぞーーーーーー
        api("/api/file/upload", {
            file: this.state.file,
            name: filedata.name,
            type: filedata.type,
            usage: filedata.usage,
            description: filedata.description,
        }, "multipart/form-data")
        .then(({id})=>{
            //アップロード成功
            this.setState({
                status: "uploaded"
            });
            if("function"===typeof this.props.onUpload){
                this.props.onUpload(id);
            }
        })
        .catch(errorStore.emit);
        //アップロード中
        this.setState({
            status: "uploading",
        });
    }
}
