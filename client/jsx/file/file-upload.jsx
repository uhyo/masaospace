var React=require('react/addons');
var mime=require('mime');
//file upload form

var masao=require('../../../lib/masao');

var api=require('../../actions/api');

var errorStore=require('../../stores/error');

var FileSelector = require('./file-selector.jsx'),
    FileDataForm = require('./file-data-form.jsx');

module.exports = React.createClass({
    displayName: "FileUpload",
    mixins:[React.addons.LinkedStateMixin],
    propTypes:{
        config: React.PropTypes.object.isRequired,
        onUpload: React.PropTypes.func,
        usage: React.PropTypes.string
    },
    getDefaultProps(){
        return {
            usage: Object.keys(masao.resourceKinds)[0]
        };
    },
    getInitialState(){
        return {
            file: null,
            //処理状態
            status: "",
        };
    },
    render(){
        return <section className="file-upload">
            <h3 className="legend">新しいファイルを追加</h3>
            <FileSelector onSelect={this.handleFile} maxsize={this.props.config.filedata.maxSize}/>
            {this.state.file!=null ? this.fileDataForm() : null}
        </section>;
    },
    fileDataForm(){
        //ファイルの情報をアレする
        var disabled, uploadtext;
        if(this.state.status==="uploadable"){
            disabled=false, uploadtext="アップロード"
        }else if(this.state.status==="uploading"){
            disabled=true, uploadtext="アップロード中"
        }else if(this.state.status==="uploaded"){
            disabled=true, uploadtext="アップロード完了"
        }
        var file=this.state.file;
        var defaultData={
            type: mime.lookup(file.name),
            name: file.name,
            usage: this.props.usage,
            descripiton: ""
        };
        return <FileDataForm config={this.props.config} submitButton={uploadtext} submitDisabled={disabled} previewURL={this.state.url} defaultFile={defaultData} onSubmit={this.handleSubmit} />;
    },
    handleFile(file){
        var url=null;
        if(/^image\//i.test(file.type)){
            //画像なのでプレビューしてみる
            url=URL.createObjectURL(file);
        }
        this.setState({
            file: file,
            url: url,
            status: "uploadable",
        });
    },
    handleSubmit(filedata){
        //ファイルをアップロードするぞーーーーーー
        api("/api/file/upload",{
            file: this.state.file,
            name: filedata.name,
            type: filedata.type,
            usage: filedata.usage,
            description: filedata.description,
        },"multipart/form-data")
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
            status: "uploading"
        });

    },
});

