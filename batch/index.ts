// import fs=require('fs');
import readline=require('readline');

var db=require('../js/db');

var ac=new db.Mongo();
ac.connect((err: any)=>{
    if(err)throw err;
    let db=ac.getClient();
    let pack=require('../package.json');
    let version=pack.version;
    //versionを得る
    var rli=readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rli.question(`Run batch for v${version}? [yne] > `,(answer)=>{
        if(/^e$/i.test(answer)){
            //EDIT
            rli.question("What version? > ",(v)=>{
                var batch=require('./'+v);
                batch.run(db,()=>{
                    rli.close();
                    ac.close();
                });
            });

        }else if(!/^y$/i.test(answer)){
            process.exit(0);
        }else{
            let batch=require('./v'+version);
            batch.run(db,()=>{
                rli.close();
                ac.close();
            });
        }
    });
});
