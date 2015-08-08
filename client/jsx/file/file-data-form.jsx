var React=require('react/addons');

var masao=require('../../../lib/masao');

var api=require('../../actions/api');

var errorStore=require('../../stores/error');

module.exports = React.createClass({
    displayName:"FileDataForm",
    mixins:[React.addons.LinkedStateMixin],
    propTypes:{
        config: React.PropTypes.object.isRequired,
        //送信ボタンの文字列
        submitButton: React.PropTypes.string.isRequired,
        submitDisabled: React.PropTypes.bool,
        //プレビュー用のURL
        previewURL: React.PropTypes.string,
        previewLink: React.PropTypes.string,
        //最初のファイルデータ
        defaultFile: React.PropTypes.shape({
            //FileData
            type: React.PropTypes.string.isRequired,
            name: React.PropTypes.string.isRequired,
            usage: React.PropTypes.string.isRequired,
            description: React.PropTypes.string.isRequired
        }),
        //送信ハンドラ
        onSubmit: React.PropTypes.func
    },
    getInitialState(){
        var f=this.props.defaultFile;
        if(f){
            return {
                type: f.type,
                name: f.name,
                usage: f.usage,
                description: f.description
            };
        }else{
            return {
                type: "",
                name: "",
                usage: "",
                description: ""
            };
        }
    },
    render(){
        //ファイルの情報をアレする
        var usages=Object.keys(masao.resourceKinds).map((key)=>{
            return [key, masao.resourceKinds[key]];
        });
        var config=this.props.config.filedata;
        //プレビュー
        var preview=null;
        if(this.props.previewURL!=null){
            if(this.props.previewLink!=null){
                preview=<div className="file-upload-preview">
                    <p>プレビュー</p>
                    <div>
                        <a href={this.props.previewLink} rel="external" target="_blank">
                            <img src={this.props.previewURL} />
                        </a>
                    </div>
                </div>;
            }else{
                preview=<div className="file-upload-preview">
                    <p>プレビュー</p>
                    <div>
                        <img src={this.props.previewURL} />
                    </div>
                </div>;
            }
        }

        return <div className="file-upload-data">
            {preview}
            <form className="form" onSubmit={this.handleSubmit}>
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
                    <input className="form-single form-button" type="submit" disabled={this.props.submitDisabled} value={this.props.submitButton} />
                </p>
            </form>
        </div>;
    },
    handleSubmit(e){
        e.preventDefault();
        var os=this.props.onSubmit;
        if("function"===typeof os){
            os({
                type: this.state.type,
                name: this.state.name,
                usage: this.state.usage,
                description: this.state.description
            });
        }
    }
});
