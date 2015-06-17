//Starter
var index;
try{
    index = require('./src/index');
}catch(e){
    index = require('./js/index');
}
var system = new index.System();
system.init(function (err) {
    if (err) {
        process.exit();
    }
});
