//handle links

var pageAction=require('../actions/page');
var pageStore=require('../stores/page');

module.exports = handleEvents;

function handleEvents(root){
    //handle click event
    document.addEventListener("click",function(ev){
        for(var t=ev.target;t;t=t.parentNode){
            if(t.nodeName==="A" && t.href){
                //internal link?
                if(t.origin===location.origin){
                    ev.preventDefault();
                    pageAction.load(t.pathname+t.search);
                    break;
                }
            }
        }
    },false);
    //history event
    window.addEventListener("popstate",function(ev){
        var state=ev.state;
        if(state){
            //some cheating
            pageAction.load.completed({
                title: state.title,
                path: state.path,
                page: state.page,
                data: state.data
            });
        }else{
            //load
            pageAction.load(location.pathname);
        }
    },false);
    //page title
    pageStore.listen(function(state){
        console.log(state);
        document.title=state.title;
    });
}

