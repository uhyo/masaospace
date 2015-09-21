var React=require('react'),
    bytes=require('bytes');

var file=require('../../scripts/file');

module.exports = React.createClass({
    displayName:"FileSelector",
    propTypes:{
        //拡張子（.は含まない）を,で区切った文字列がいい
        accept: React.PropTypes.string,
        onSelect: React.PropTypes.func,
        maxsize: React.PropTypes.number
    },
    getInitialState:function(){
        return {
            file: null
        };
    },
    handleDragEnter:function(e){
        e.preventDefault();
    },
    handleDragOver:function(e){
        e.preventDefault();
        var ts=e.dataTransfer.types;
        var flg=false;
        for(var i=0;i < ts.length; i++){
            if(ts[i]==="Files"){
                flg=true;
                break;
            }
        }
        if(flg===false){
            //ファイルがきてないよ
            e.dataTransfer.dropEffect="none";
        }else{
            e.dataTransfer.dropEffect="copy";
        }
    },
    handleDrop:function(e){
        e.preventDefault();
        var file=e.dataTransfer.files[0];
        if(file==null){
            return;
        }
        this.setState({
            file: file
        });
        if("function"===typeof this.props.onSelect){
            this.props.onSelect(file);
        }
    },
    render:function(){
        var inn;
        if(this.state.file){
            inn = this.acceptedView();
        }else{
            inn = this.acceptingView();
        }
        return (
            <div className="fileselector">
                <div className="fileselector-dragarea" onDragEnter={this.handleDragEnter} onDragOver={this.handleDragOver} onDrop={this.handleDrop}>{
                    inn
                }</div>
            </div>
        );
    },
    acceptedView:function(){
        var file=this.state.file, name=file.name, size=file.size, maxsize=this.props.maxsize;
        var sizewarn=null;
        if(maxsize!=null && size>maxsize){
            //オーバーしてる
            sizewarn=<p className="warning-string">ファイルサイズがアップロード可能なサイズを超えています。</p>;
        }
        return (
            <div>
                <p>ファイル：{name}</p>
                {sizewarn}
                <p><span className="clickable" onClick={this.handleFileSelect}>ファイルを選択...</span></p>
            </div>
        );
    },
    acceptingView:function(){
        var accepts=null, limits=null;
        var accept=this.props.accept, maxsize=this.props.maxsize;
        if(accept){
            accepts = accept.split(",").map((ext)=>{
                return `${ext.trim()}ファイル`;
            }).join(", ") + "を読み込めます。";
        }
        if(maxsize!=null){
            //最大サイズが指定されている
            limits = "アップロードできるファイルのサイズは最大"+bytes(maxsize)+"です。";
        }
        return (
            <div>
                <p>ここにファイルをドラッグしてください。</p>
                {accepts || limits ? <p className="fileselector-accept">{accepts}{limits}</p> : null}
                <p><span className="clickable" onClick={this.handleFileSelect}>ファイルを選択...</span></p>
            </div>
        );
    },
    handleFileSelect(e){
        e.preventDefault();
        file.selectFile((f)=>{
            this.setState({
                file: f
            });
            if("function"===typeof this.props.onSelect){
                this.props.onSelect(f);
            }
        });
    },
});
