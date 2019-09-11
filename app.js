var express = require('express');
var bodyParser     =        require("body-parser");
var app            =        express();
var longpoll = require("express-longpoll")(app)
var longpollWithDebug = require("express-longpoll")(app, { DEBUG: true });
var fs = require('fs');

//var firebase = require("firebase");
// // TODO: Replace the following with your app's Firebase project configuration
// var firebaseConfig = {
//     apiKey: "AIzaSyAbQiiBVVVivgl_hbbefHgw-QDS8Q-q3zo",
//     authDomain: "geniusbyte-e32ea.firebaseapp.com",
//     databaseURL: "https://geniusbyte-e32ea.firebaseio.com",
//     projectId: "geniusbyte-e32ea",
//     storageBucket: "",
//     messagingSenderId: "336609968803",
//     appId: "1:336609968803:web:b3060393e6167705e97516"
// };
  
// // Initialize Firebase
// firebase.initializeApp(firebaseConfig);

//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var listaccident = {
    accidents: []
};

var timeConnection
var lastconnection

app.post('/accident',function(req,res) {
    console.log(req.body)
    fs.exists('./accidents.json', function(exists){
        if(exists){
            console.log("yes file exists");
            fs.readFile('./accidents.json', function readFileCallback(err, data){
                if (err){
                    console.log(err);
                } else {
                    listaccident = JSON.parse(data); 

                    console.log(listaccident) 

                    accident = { 

                        description: req.body.accident.description, 
                        
                        dateheure : Date.now()/1000
                    }

                    location = {
                
                        name: req.body.location.name,
                
                        longitude: req.body.location.longitude,
                        
                        latitude: req.body.location.latitude
                    }

                    listaccident.accidents.push ({accident: accident, location:location})

                    var content = JSON.stringify(listaccident);
                    fs.writeFile('./accidents.json' , content , 'utf8', function (err) {
                        if (err) {
                            console.log("An error occured while writing JSON Object to File.");
                            return console.log(err);
                        }
                        console.log("JSON file has been saved.");

                        longpoll.publish("/poll_web", JSON.stringify({accident: accident, location:location}));  
                    
                        lastconnection =  Date.now()/1000;

                        longpoll.publish("/poll_mobile", JSON.stringify({accident: accident, location:location})); 

                    });
                }
            });
        } else {
            console.log("file not exists") 

            accident = { 

                description: req.body.accident.description, 
                
                dateheure : Date.now()/1000
            }

            location = {
        
                name: req.body.location.name,
        
                longitude: req.body.location.longitude,
                
                latitude: req.body.location.latitude
            }

            listaccident.accidents.push ({accident: accident, location:location})

            console.log(listaccident) 

            var content = JSON.stringify(listaccident);
            fs.writeFile('./accidents.json' , content , 'utf8', function (err) {
            if (err) {
                console.log("An error occured while writing JSON Object to File.");
                return console.log(err);
            }
            console.log("JSON file has been saved.");

            longpoll.publish("/poll_web", JSON.stringify({accident: accident, location:location}));       

            lastconnection = Date.now()/1000;

            longpoll.publish("/poll_mobile", JSON.stringify({accident: accident, location:location})); 
            });
        }
    });

    // req.body.accident.dateheure = Date.now()/1000

    // var content = JSON.stringify(req.body)

    // fs.writeFile('./accident/'+Date.now()/1000+'.json' , content , 'utf8', function (err) {
    //     if (err) {
    //         console.log("An error occured while writing JSON Object to File.");
    //         return console.log(err);
    //     }
    //     console.log("JSON file has been saved.");

    //     longpoll.publish("/poll", require('./accident/'+files[0]));       
        
    // });

    // fs.unlink('./accident/'+files[0], (err) => {
    //     if (err) throw err;
    //     console.log('successfully deleted the oldest notif');
    // });


    res.end("yes")
});

// var files = fs.readdirSync('./accident');

// console.log(files)

longpoll.create("/poll_web", function (req,res,next) {

    timeConnection = Date.now()/1000
    // need time of last connexion fromclient

    fs.exists('./accidents.json', function(exists){
        var listPastAccident = {
            accidents: []
        };
        
        if(exists){
            //console.log("yes file exists");
            fs.readFile('./accidents.json', function readFileCallback(err, data){
                if (err){
                    console.log(err);
                } else {

                    listaccident = JSON.parse(data); 

                    //console.log(listaccident)

                    for (let i = 0; i < listaccident.accidents.length; i++) {
                        //console.log(listaccident.accidents[i].accident.dateheure)
                        //console.log(timeConnection)
                        if (listaccident.accidents[i].accident.dateheure < timeConnection && listaccident.accidents[i].accident.dateheure > lastconnection){
                            listPastAccident.accidents.push(listaccident.accidents[i])
                            //console.log(listPastAccident)
                        }    
                    }

                    var content = JSON.stringify(listPastAccident);

                    if (listPastAccident.accidents.length > 0)  {
                        longpoll.publish("/poll", content); 
                        lastconnection = Date.now()/1000;
                    }        
                }
            });
        }else {
            //console.log("file not exists") 
        }
    });
    
    next();
});

longpoll.create("/poll_mobile", function (req,res,next) {
    next();
});

app.listen(8080, function() {
    console.log("Listening on port 8080");
});

// // Publish every 5 seconds
// setInterval(function () { 
//     files = fs.readdirSync('./accident');
//     console.log(files)
//     if (files.length > 0) {
//         longpoll.publish("/poll", require('./accident/'+files[0]));
//         fs.unlink('./accident/'+files[0], (err) => {
//             if (err) throw err;
//             console.log('successfully deleted the oldest notif');
//         });
//     }
// }, 5000);

