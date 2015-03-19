//Starter

import index=require('./src/index');

var system=new index.System();

system.init((err:any)=>{
    if(err){
        process.exit();
    }
});
