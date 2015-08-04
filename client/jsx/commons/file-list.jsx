var React=require('react');
//file list

var api=require('../../actions/api');

var errorStore=require('../../stores/error');

var Loading=require('./loading.jsx');

module.exports = React.createClass({
    displayName:"FileList",
    propTypes:{
        query: React.PropTypes.shape({
            owner: React.PropTypes.string,
            usage: React.PropTypes.string
        }).isRequired,
        fileLink: React.PropTypes.shape({
            value: React.PropTypes.string,
            requestChange: React.PropTypes.func.isRequired
        }).isRequired
    },
    getInitialState(){
        return {
            loading: true,
            files: []
        };
    },
    componentDidMount(){
        this.load(this.props.query);
    },
    componentWillReceiveProps(nextProps){
        if(this.props.query!==nextProps.query){
            this.load(nextProps.query);
        }
    },
    load(query){
        this.setState({
            loading: true
        });
        api("/api/file/list",this.props.query)
        .then(({files})=>{
            //filesがきた
            this.setState({
                loading: false,
                files: files
            });
        })
        .catch(errorStore.emit);
    },
    render(){
        if(this.state.loading===true){
            return <Loading />;
        }
        var current = this.props.fileLink.value;
        return <div className="file-list-container">
            <div className="file-list-main">{
                ["default"].concat(this.state.files).map((file,i)=>{
                    var className="file-list-file", handleClick;
                    if(file==="default"){
                        //デフォルトを使用するボタん
                        className+=" file-list-default";
                        if(current===""){
                            className+=" file-list-current";
                        }
                        handleClick = this.clickHandler("");
                        return <div key={i}className={className} onClick={handleClick}>デフォルトの画像を使用する</div>;
                    }else{
                        //ファイル
                        if(current===file.id){
                            className+=" file-list-current";
                        }
                        handleClick = this.clickhandler(file.id);
                        return <div key={i} className={className} onClick={handleClick}>
                            <div className="file-list-file-name">{file.name}</div>
                            <p className="file-list-file-description">{file.description}</p>
                        </div>;
                    }
                })
            }</div>
        </div>;
    },
    clickHandler(fileid){
        return ()=>{
            var fl=this.props.fileLink;
            if(fl){
                fl.requestChange(fileid);
            }
        };
    }
});

