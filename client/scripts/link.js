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
}

