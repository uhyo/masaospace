//メタデータフォーム
var React=require('react');

var StrList=require('../commons/form-strlist.jsx');

module.exports = React.createClass({
    displayName:"GameMetadataForm",
    propTypes:{
        title: React.PropTypes.string,
        description: React.PropTypes.string,
        tags: React.PropTypes.arrayOf(React.PropTypes.string.isRequired),

        // {title, description,tags}
        onChange: React.PropTypes.func
    },
    getInitialState(){
        return {
            title: this.props.title || "",
            description: this.props.description || "",
            tags: this.props.tags || []
        };
    },
    componentWillReceiveProps(nextProps){
        this.setState({
            title: nextProps.title || this.state.title,
            description: nextProps.description || this.state.description,
            tags: nextProps.tags || this.state.tags
        });
    },
    handleChange(e){
        var t=e.target;
        if(t.name==="title" || t.name==="description"){
            this.setState({
                [t.name]: t.value
            },function(){
                if("function"===typeof this.props.onChange){
                    this.props.onChange({
                        title: this.state.title,
                        description: this.state.description,
                        tags: this.state.tags
                    });
                }
            });
        }
    },
    handleTags(tags){
        this.setState({
            tags
        },function(){
            if("function"===typeof this.props.onChange){
                this.props.onChange({
                    title: this.state.title,
                    description: this.state.description,
                    tags: this.state.tags
                });
            }
        });
    },
    handleSubmit(e){
        e.preventDefault();
    },
    render:function(){
        return (
            <form className="form" onSubmit={this.handleSubmit}>
                <p>
                    <label className="form-row">
                        <span>タイトル</span>
                        <input type="text" name="title" onChange={this.handleChange} value={this.state.title} />
                    </label>
                </p>
                <p>
                    <label className="form-row">
                        <span>説明</span>
                        <textarea name="description" onChange={this.handleChange} value={this.state.description} />
                    </label>
                </p>
                <div>
                    <span className="form-row">
                        <span>タグ</span>
                        <StrList value={this.state.tags} onChange={this.handleTags} />
                    </span>
                </div>
            </form>
        );
    },
});

