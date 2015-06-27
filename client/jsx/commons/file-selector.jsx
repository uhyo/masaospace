var React=require('react');

module.exports = React.createClass({
    displayName:"FileSelector",
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
        return (
            <div>
                <div className="fileselector-dragarea" onDragEnter={this.handleDragEnter} onDragOver={this.handleDragOver} onDrop={this.handleDrop}>
                    ここ（あとでCSSで調整する）
                </div>
                <p>ここにファイルをドラッグしてください。</p>
            </div>
        );
    }
});
