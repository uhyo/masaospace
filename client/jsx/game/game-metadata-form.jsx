//メタデータフォーム
var React=require('react');

module.exports = React.createClass({
    displayName:"GameMetadataForm",
    propTypes:{
        title: React.PropTypes.string,
        description: React.PropTypes.string
    },
    getInitialState:function(){
        return {
            title: this.props.title || "",
            description: this.props.description || ""
        };
    },
    handleChange:function(e){
        var t=e.target;
        if(t.name==="title" || t.name==="description"){
            this.setState({
                [t.name]: t.value
            },function(){
                if("function"===typeof this.props.onChange){
                    this.props.onChange({
                        title: this.state.title,
                        description: this.state.description
                    });
                }
            });
        }
    },
    handleSubmit:function(e){
        e.preventDefault();
    },
    render:function(){
        return (
            <section className="game-metadata-form">
                <h1>正男情報</h1>
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
                </form>
            </section>
        );
    },
});

