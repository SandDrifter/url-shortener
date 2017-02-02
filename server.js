var express = require("express");
var app = express();

app.get('/:url',function(req,res){
    console.log(req.params.url);
});

var port = app.process.env.PORT || 8080; //8080 is the c9 environment port?
app.listen(port,function(){
    console.log("listenning port:" + port);
});