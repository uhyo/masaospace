//メタデータフォーム
var React=require('react');

module.exports = React.createClass({
    displayName:"GameMetadataForm",
    getInitialState:function(){
        return {
            title: this.props.title || "",
            level: this.props.level || "0",
            description: this.props.description || ""
        };
    },
    handleChange:function(e){
        var t=e.target;
        if(t.name==="title" || t.name==="level" || t.name==="description"){
            this.setState({
                [t.name]: t.value
            });
            if("function"===typeof this.props.onChange){
                this.props.onChange({
                    title: this.state.title,
                    level: this.state.level,
                    description: this.state.description
                });
            }
        }
    },
    handleSubmit:function(e){
        e.preventDefault();
    },
    render:function(){
        return (
            <section>
                <h1>正男情報</h1>
                <form onSubmit={this.handleSubmit}>
                    <p>タイトル: <input type="text" name="title" onChange={this.handleChange} /></p>
                    <p>難易度: <input type="number" name="level" min="0" step="1" onChange={this.handleChange} /></p>
                    <p>説明: <textarea name="description" onChange={this.handleChange} /></p>
                </form>
            </section>
        );
    },
});

