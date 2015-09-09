var React=require('react');
var bytes=require('bytes');
var extend=require('extend');
//file list

var api=require('../../actions/api');

var errorStore=require('../../stores/error');

var masao=require('../../../lib/masao');
var Loading=require('../commons/loading.jsx'),
    FileUpload=require('./file-upload.jsx');

module.exports = React.createClass({
    displayName:"FileList",
    propTypes:{
        config: React.PropTypes.object.isRequired,
        query: React.PropTypes.shape({
            owner: React.PropTypes.string,
            usage: React.PropTypes.string
        }).isRequired,
        forceLoad: React.PropTypes.bool,
        fileLink: React.PropTypes.shape({
            value: React.PropTypes.oneOfType([
                React.PropTypes.string,
                React.PropTypes.object
            ]),
            requestChange: React.PropTypes.func.isRequired
        }).isRequired,
        //「デフォルトの画像を使用する」を選択できるかどうか
        useDefault: React.PropTypes.bool,
        //合計容量を表示するかどうか
        diskSpace: React.PropTypes.bool,
        //プレビューリンクを表示するかどうか
        usePreviewLink: React.PropTypes.bool
    },
    getInitialState(){
        return {
            query: this.props.query,
            loading: true,
            files: [],
            file_upload: false,
        };
    },
    componentDidMount(){
        this.load();
    },
    componentWillReceiveProps(nextProps){
        //検索条件が違うときだけ再読み込み
        var oldQuery=this.props.query, newQuery=nextProps.query;
        if(nextProps.forceLoad===true || oldQuery.owner!==newQuery.owner || oldQuery.usage!==newQuery.usage){
            this.setState({
                file_upload: false,
                query: newQuery
            },()=>{
                this.load();
            });
            this.load();
        }else{
            this.setState({
                file_upload: false
            });
        }
    },
    load(cb){
        if(this.state.query.owner==null){
            //あれ？（未登録ユーザー）
            this.setState({
                loading: false,
                files: []
            });
            setTimeout(cb,0);
            return;
        }
        this.setState({
            loading: true
        });
        api("/api/file/list",this.state.query)
        .then(({files})=>{
            //filesがきた
            this.setState({
                loading: false,
                files: files
            });
            if(cb){
                cb();
            }
        })
        .catch(errorStore.emit);
    },
    render(){
        if(this.state.loading===true){
            return <Loading />;
        }
        var currentFile = this.props.fileLink.value;
        var current;
        if(this.state.file_upload===true){
            current="file";
        }else if(!currentFile){
            current="default";
        }else if("string"===typeof currentFile){
            current=currentFile;
        }else{
            current=currentFile.id;
        }
        var files=this.state.files;

        var additional = ["file"];
        if(this.props.useDefault===true){
            //デフォルト("")あり
            additional.unshift("default");
        }
        var diskInfo = null;
        if(this.props.diskSpace===true){
            //容量計算あり
            var disk=0;
            for(var i=0;i < files.length; i++){
                disk+=files[i].size;
            }
            diskInfo = <div className="file-list-info">
                <p>使用中: {bytes.format(disk)} / {bytes.format(this.props.config.filedata.diskSpace)}</p>
            </div>;
        }

        return <section className="file-list-container">
            <h1 className="legend">ファイルリスト</h1>
            <p className="file-list-query">
                検索条件：<select valueLink={this.linkQueryState()}>
                    <option value="">全て</option>
                    {
                        Object.keys(masao.resourceKinds).map((key)=>{
                            return <option value={key} key={key}>{masao.resourceKinds[key]}</option>;
                        })
                    }
                </select>
            </p>
            {diskInfo}
            <div className="file-list-main">{
                additional.concat(files).map((file,i)=>{
                    var className="file-list-file", handleClick;
                    if(file==="default"){
                        //デフォルトを使用するボタん
                        className+=" file-list-command file-list-default";
                        if(current==="default"){
                            className+=" file-list-current";
                        }
                        handleClick = this.clickHandler(null);
                        return <div key={i} className={className} onClick={handleClick}>デフォルトの画像を使用する</div>;
                    }else if(file==="file"){
                        //ファイルアップロード
                        className+=" file-list-command";
                        if(current==="file"){
                            className+=" file-list-current";
                        }
                        return <div key={i} className={className} onClick={this.handleUploadCommand}>
                            <div>
                                <span className="icon icon-fileplus" />
                            </div>
                            <div>新しいファイルを追加...</div>
                        </div>;
                    }else{
                        //ファイル
                        if(current===file.id){
                            className+=" file-list-current";
                        }
                        handleClick = this.clickHandler(file);
                        var previewLink = this.props.usePreviewLink===true ?
                            <p className="file-list-file-preview-link">
                                <a href={"/uploaded/"+file.id} className="external" target="_blank">プレビュー</a>
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
    },
    linkQueryState(){
        return {
            value: this.state.query.usage || "",
            requestChange: (value)=>{
                this.setState({
                    query: extend({},this.state.query,{
                        usage: value || null
                    })
                },()=>{
                    this.load();
                });
            }
        };
    },
    clickHandler(file){
        return ()=>{
            var fl=this.props.fileLink;
            if(fl){
                fl.requestChange(file);
            }
        };
    },
    handleUploadCommand(e){
        //ファイルアップロードボタンが押された
        this.setState({
            file_upload: true
        });
    },
    handleFileUpload(fileid){
        this.load(()=>{
            //該当ファイルを探す
            var rc=this.props.fileLink.requestChange, files=this.state.files;
            for(var i=0;i < files.length;i++){
                if(files[i].id===fileid){
                    rc(files[i]);
                    return;
                }
            }
            //せっかくアップロードしたのに該当ファイルがない？
            rc(null);
        });
    },
    fileUpload(){
        //ファイルアップロード部分
        return <FileUpload config={this.props.config} onUpload={this.handleFileUpload} usage={this.state.query.usage} />;
    }
});

