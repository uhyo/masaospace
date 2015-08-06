var React=require('react/addons');
var mime=require('mime');
//file upload form

var api=require('../../actions/api');

var errorStore=require('../../stores/error');

var FileSelector = require('./file-selector.jsx');

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
            usage: ""
        };
    },
    getInitialState(){
        return {
            file: null,
            //処理状態
            status: "",
            //ファイルのメタデーーーーーーーータ
            type: "",
            name: "",
            usage: this.props.usage,
            description: ""
        };
    },
    render(){
        return <div>
            <FileSelector onSelect={this.handleFile} />
            {this.state.file!=null ? this.fileData() : null}
        </div>;
    },
    fileData(){
        //ファイルの情報をアレする
        //TODO
        var usages=[
            ['filename_pattern','パターン画像'],
            ['filename_title','タイトル画像'],
            ['filename_ending','エンディング画像'],
            ['filename_gameover','ゲームオーバー画像'],
            ['filename_mapchip','マップチップ（背景レイヤー）画像'],
            ['filename_haikei','背景画像'],
            ['','その他']
        ];
        var config=this.props.config.filedata;
        var uploadbutton, disabled, uploadtext;
        if(this.state.status==="uploadable"){
            disabled=false, uploadtext="アップロード"
        }else if(this.state.status==="uploading"){
            disabled=true, uploadtext="アップロード中"
        }else if(this.state.status==="uploaded"){
            disabled=true, uploadtext="アップロード完了"
        }
        uploadbutton = <input className="form-single form-button" type="submit" disabled={disabled} value={uploadtext} />;

        return <form className="form" onSubmit={this.handleSubmit}>
            <p>
                <label className="form-row">
                    <span>ファイル名</span>
                    <input type="text" required maxLength={config.name.maxLength} valueLink={this.linkState("name")} />
                </label>
            </p>
            <p>
                <label className="form-row">
                    <span>種類</span>
                    <input type="text" readOnly value={this.state.type} />
                </label>
            </p>
            <p>
                <label className="form-row">
                    <span>用途</span>
                    <select valueLink={this.linkState("usage")}>
                        {
                            usages.map(([value,name])=>{
                                return <option key={value} value={value}>{name}</option>;
                            })
                        }
                    </select>
                </label>
            </p>
            <p>
                <label className="form-row">
                    <span>説明</span>
                    <textarea maxLength={config.description.maxLength} valueLink={this.linkState("description")} />
                </label>
            </p>
            <p>
                {uploadbutton}
            </p>
        </form>;
    },
    handleFile(file){
        this.setState({
            file: file,
            status: "uploadable",
            type: mime.lookup(file.name),
            name: file.name,
            description: ""
        });
    },
    handleSubmit(e){
        e.preventDefault();
        //ファイルをアップロードするぞーーーーーー
        api("/api/file/upload",{
            file: this.state.file,
            name: this.state.name,
            type: this.state.type,
            usage: this.state.usage,
            description: this.state.description,
        },"multipart/form-data")
        .then(({id})=>{
            //アップロード成功
            if("function"===typeof this.props.onUpload){
                this.props.onUpload(id);
            }
            this.setState({
                status: "uploaded"
            });
        })
        .catch(errorStore.emit);
        //アップロード中
        this.setState({
            status: "uploading"
        });

    },
});

