var express = require('express');
var bodyParser     =        require("body-parser");
var app            =        express();
var longpoll = require("express-longpoll")(app)
// You can also enable debug flag for debug messages
var longpollWithDebug = require("express-longpoll")(app, { DEBUG: true });
var fs = require('fs');

//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.post('/accident',function(req,res) {
    //console.log(req.body);

    req.body.accident.dateheure = Date.now()/1000

    //console.log(req.body);

    var content = JSON.stringify(req.body)

    //console.log(content)

    fs.writeFile('./accident/'+Date.now()/1000+'.json' , content , 'utf8', function (err) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
        }
        console.log("JSON file has been saved.");
    });
    res.end("yes")
  });






app.listen(8080);