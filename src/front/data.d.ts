interface View{
    status?:number;
    title:string;
    page:string;
    data:any;
}

interface _Router{
    add(path:string,value:(obj:any,callback:Callback<View>)=>void):void;
    addPattern(seg:string,pattern:RegExp):void;
}
