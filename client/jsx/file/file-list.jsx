var React=require('react');
var bytes=require('bytes');
//file list

var api=require('../../actions/api');

var errorStore=require('../../stores/error');

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
        fileLink: React.PropTypes.shape({
            value: React.PropTypes.string,
            requestChange: React.PropTypes.func.isRequired
        }).isRequired,
        //「デフォルトの画像を使用する」を選択できるかどうか
        useDefault: React.PropTypes.bool,
        //合計容量を表示するかどうか
        diskSpace: React.PropTypes.bool
    },
    getInitialState(){
        return {
            loading: true,
            files: [],
            file_upload: false,
        };
    },
    componentDidMount(){
        this.load(this.props.query);
    },
    componentWillReceiveProps(nextProps){
        //検索条件が違うときだけ再読み込み
        var oldQuery=this.props.query, newQuery=nextProps.query;
        if(oldQuery.owner!==newQuery.owner || oldQuery.usage!==newQuery.usage){
            this.load(nextProps.query);
        }
        this.setState({
            file_upload: false
        });
    },
    load(query,cb){
        this.setState({
            loading: true
        });
        api("/api/file/list",query)
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
        var current = this.props.fileLink.value;
        if(this.state.file_upload===true){
            current="file";
        }else if(!current){
            current="default";
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

        return <div className="file-list-container">
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
                        handleClick = this.clickHandler("");
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
                        handleClick = this.clickHandler(file.id);
                        return <div key={i} className={className} onClick={handleClick}>
                            <div className="file-list-file-name">{file.name}</div>
                            <p className="file-list-file-description">{file.description}</p>
                            <p className="file-list-file-preview-link">
                                <a href={"/uploaded/"+file.id} className="external" target="_blank">プレビュー</a>
                            </p>
                        </div>;
                    }
                })
            }</div>
            { this.state.file_upload ? this.fileUpload() : null}
        </div>;
    },
    clickHandler(fileid){
        return ()=>{
            var fl=this.props.fileLink;
            if(fl){
                fl.requestChange(fileid);
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
        this.load(this.props.query,()=>{
            this.props.fileLink.requestChange(fileid);
        });
    },
    fileUpload(){
        //ファイルアップロード部分
        return <FileUpload config={this.props.config} onUpload={this.handleFileUpload} usage={this.props.query.usage} />;
    }
});

