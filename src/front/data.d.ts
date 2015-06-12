interface View{
    title:string;
    page:string;
    data:any;
}

interface _Router{
    add(path:string,value:Callback<View>):void;
}
