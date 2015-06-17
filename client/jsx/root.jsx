var React=require('react');
var Reflux=require('reflux');

var pageStore = require('../stores/page');

var Header=require('./header.jsx');
var Footer=require('./footer.jsx');

var Top=require('./top.jsx');

var Root = React.createClass({
    displayName:"Root",
    mixins: [Reflux.connect(pageStore,"page")],
    render:function(){
        var page=this.getPage();
        return (<div>
            <Header />
            {page}
            <Footer />
        </div>);
    },
    getPage:function(){
        var page=this.state.page || this.props;
        switch(page.page){
            case "top":
                //top page
                return React.createElement(Top,page.data);
        }
    }
});

module.exports = Root;
