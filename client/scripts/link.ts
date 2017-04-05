//handle links

import * as pageAction from '../actions/page';
import pageStore from '../stores/page';

export default function handleEvents(){
    //handle click event
    document.addEventListener("click",function(ev){
        let t: Node | null = ev.target as Node;
        for(; t; t=t.parentNode){
            if(t.nodeName === 'A'){
                const ta = t as HTMLAnchorElement & {
                    // Polyfill
                    origin: string;
                };
                if (!ta.href){
                    continue;
                }
                //internal link?
                if(ta.origin===location.origin && !ta.classList.contains("external") && !ta.classList.contains("nop") && ta.target!=="_blank"){
                    ev.preventDefault();
                    pageAction.load(ta.pathname+ta.search);
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
    pageStore.listen((state: any)=>{
        console.log(state);
        document.title=state.title;
    });
}

