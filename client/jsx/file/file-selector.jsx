var React=require('react');

module.exports = React.createClass({
    displayName:"FileSelector",
    propTypes:{
        //拡張子（.は含まない）を,で区切った文字列がいい
        accept: React.PropTypes.string,
        onSelect: React.PropTypes.func
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
        var name=this.state.file.name;
        return (
            <div>
                <p>ファイル：{name}</p>
            </div>
        );
    },
    acceptingView:function(){
        var accepts=null;
        var accept=this.props.accept;
        if(accept){
            accepts = accept.split(",").map((ext)=>{
                return `${ext.trim()}ファイル`;
            }).join(", ") + "を読み込めます。";
        }
        return (
            <div>
                <p>ここにファイルをドラッグしてください。</p>
                {accepts ? <p className="fileselector-accept">{accepts}</p> : null}
            </div>
        );
    }
});
