//横にならぶmenu

var React=require('react');

module.exports = React.createClass({
    displayName:"Horizontalmenu",
    propTypes:{
        contents: React.PropTypes.arrayOf(React.PropTypes.shape({
            id: React.PropTypes.string,
            name: React.PropTypes.string
        })).isRequired,
        page: React.PropTypes.string,
        onChange: React.PropTypes.func,
        pageLink: React.PropTypes.shape({
            value: React.PropTypes.string,
            requestChange: React.PropTypes.func
        })
    },
    render(){
        var current=this.props.pageLink ? this.props.pageLink.value : this.props.page;
        return <ul className="horizontal-menu">{
            this.props.contents.map(({id,name})=>{
                var className = current===id ? "horizontal-menu-current" : null;
                return <li key={id} className={className} onClick={this.clickHandler(id)}>{name}</li>;
            })
        }</ul>;
    },
    clickHandler(id){
        return (e)=>{
            e.preventDefault();
            if(this.props.pageLink){
                this.props.pageLink.requestChange(id);
            }else if("function"===typeof this.props.onChange){
                this.props.onChange(id);
            }
        };
    },
});
