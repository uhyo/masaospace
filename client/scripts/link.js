//handle links

var pageAction=require('../actions/page');

module.exports = handleEvents;

function handleEvents(root){
    //handle click event
    document.addEventListener("click",function(ev){
        for(var t=ev.target;t;t=t.parentNode){
            if(t.nodeName==="A"){
                //internal link?
                if(t.origin===location.origin){
                    ev.preventDefault();
                    pageAction.load(t.pathname);
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
                path: state.path,
                page: state.page,
                data: state.data
            });
        }else{
            //load
            pageAction.load(location.pathname);
        }
    },false);
}

