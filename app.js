var express = require('express');
var bodyParser     =        require("body-parser");
var app            =        express();
//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.listen(8081);