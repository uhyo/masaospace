var React=require('react');

var Header=require('./header.jsx');
var Footer=require('./footer.jsx');

var Top=require('./top.jsx');

class Root extends React.Component{
    render(){
        var page=this.getPage();
        return (<div>
            <Header />
            {page}
            <Footer />
        </div>)
    }

    getPage(){
        var page=this.props.page;
        switch(page){
            case "top":
                //top page
                return React.createElement(Top,this.props.data);
        }
    }
}

module.exports = Root;
