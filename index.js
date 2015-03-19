//Starter
var index = require('./src/index');
var system = new index.System();
system.init(function (err) {
    if (err) {
        process.exit();
    }
});
