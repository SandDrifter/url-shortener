var express = require("express");
var app = express();
var mongodb = require('mongodb');
var shortid = require('shortid');
var validUrl = require('valid-url');
var url = require('url') ;

var config = require('./config');
var dbUrl = 'mongodb://' + config.db.host + '/' + config.db.name;
console.log("***Database url***:" + dbUrl);

var MongoClient = mongodb.MongoClient;

var params ="" ;
var shortCode;
var insertLink;
var fs =  require('fs');

var baseUrl;

app.get('/', function(req, res) {
    fs.readFile(__dirname + '/index.html', 'utf8', function(err, text){
        res.send(text);
    });
});


//you need to run the following command from your heroku remote:
//heroku config:set MONGOLAB_URI=mongodb://username:password@ds01316.mlab.com:1316/food

/*
MongoClient.connect(url, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    console.log('Connection established to', "secret URI with username and password");

    // do some work here with the database.

    //Close connection
    db.close();
  }
});*/
//var newLink = function (db, callback){console.log("the hell?")} ;

app.get('/new/:newUrl(*)',function(req,res){
  if (validUrl.isUri(req.params.newUrl)) {
  // if URL is valid, do this

    console.log("new url:" + req.params.newUrl);
    params = req.params.newUrl;
    console.log("params=" + params);
    console.log(url);
    
    //getting base url
    var hostname = req.headers.host; // hostname = 'localhost:8080'
  //var pathname = url.parse(req.url).pathname; // pathname = '/MyApp'
  baseUrl = 'http://' + hostname + '/' ;//+ pathname;
  console.log(baseUrl);

//connecting to database to insert the short link  
    MongoClient.connect(dbUrl, function (err, db) {
    if (err) {
        console.log("Unable to connect to server", err);
    } else {
        var collection = db.collection('links');
        console.log("Connected to server");
        
        console.log("params=" + params);
        var newLink = function (db, callback) {
        try{
            shortCode = shortid.generate();
            insertLink = { "longLink": params, shortLink:baseUrl + shortCode };
            collection.insertOne(insertLink);
            
           // res.send(params);
            console.log("link inserted");
           // db.close();
           callback();
        }catch(err){
            console.log(err);
        } 
        };//end of MongoClient.connect
        
    };//end of app.get
    
     newLink(db, function () {
         console.log("starting newLink callback!");
         res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(insertLink));
        console.log("JSON sent");
        db.close();
      });
    
    });
    
  } else {
  // if URL is invalid, do this
  res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({"error": "Wrong url format, make sure you have a valid protocol and real site."}));
};
    
}); 


app.get('/:shortLink', function (req, res, next) {
    console.log("###Starting magic###");
 
  MongoClient.connect(dbUrl, function (err, db) {
    if (err) {
      console.log("Unable to connect to server", err);
    } else {
      console.log("Connected to server")
        console.log("collection selected");
 
      var collection = db.collection('links');
      var params2 = req.params.shortLink;
      console.log("params= " + params2);
        
      var findLink = function (db, callback) {
          collection.findOne({ "shortLink":baseUrl + params2 }, { 'shortLink': 1, _id: 0,'longLink':1 }, function (err, doc) {
          if (doc != null) {
            console.log("redirectting to long link?")
            console.log(doc.longLink);
            res.redirect(doc.longLink);
          } else {
            res.json({ error: "No corresponding shortlink found in the database." });
          };
          });//end of collection.findOne
          callback();
      };
 
      findLink(db, function () {
        db.close();
      });
 
    };
  });
});//end of app.get /:shortLink





var port = process.env.PORT || 8080; //8080 is the c9 environment port?
app.listen(port,function(){
    console.log("listenning port:" + port);
});