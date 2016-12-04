var express = require('express');
var app = express();
require('es6-promise').polyfill();
var pg = require('pg');
var bodyParser = require('body-parser');
const util = require('util');
var db_url = process.env.DATABASE_URL;

// Create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

pg.defaults.ssl = true;



app.get('/', function (req, res) {
  res.send('Hello World');
})

app.get('/users', function(req, res) {
  response = [];
  pg.connect(db_url, function(err, client) {
    if (err) {
      console.log("Ran into error");
      throw err;
    } 
    var i = 0;
    client.query('SELECT * from Users;').on('row', function(row){
      response.push(row);
      console.log("Content of Users:")
      console.log(JSON.stringify(row));
    }).on("end", function() {
      res.end(JSON.stringify(response));
    });
  });
})


app.post('/users', urlencodedParser, function (req, res) {
  pg.connect(db_url, function(err, client) {
    if (err) {
      console.log("Ran into error");
      throw err;
    } 
    console.log(req.body);
    var query = "INSERT INTO USERS(id, username, password) VALUES(" + req.body.userid + ", '" + req.body.username + "', '" + req.body.password + "');";
    console.log(query);
    client.query(query);
  });
})

app.post('/users/delete', urlencodedParser, function (req, res) {
  pg.connect(db_url, function(err, client) {
    if (err) {
      console.log("Ran into error");
      throw err;
    } 
    console.log(req.body);
    var query = "DELETE FROM USERS;"
    console.log(query);
    client.query(query);
  });
})


// GET posts, filtered by location
app.get('/posts', function(req, res) {
  response = [];
  pg.connect(db_url, function(err, client) {
    if (err) {
      console.log("Ran into error");
      throw err;
    } 
    var i = 0;
    console.log(req.query);
    console.log("******************");

    var query = util.format('SELECT title, body, start_time, end_time, user_id AS poster, tag_1, tag_2, tag_3 ' +
      'FROM Post INNER JOIN Location ON Post.location_id = Location.id ' + 
      'WHERE Location.name = "%s"', 
      req.query.location);
    client.query(query).on('row', function(row){
      response.push(row);
      console.log("Content of Users:")
      console.log(JSON.stringify(row));
    }).on("end", function() {
      res.end(JSON.stringify(response));
    });
  });
})

// DELETE posts if the end date is less than the current date
function deleteByDate(date) {
  app.post('/posts/delete', urlencodedParser, function (req, res) {
    pg.connect(db_url, function(err, client) {
      if (err) {
        console.log("Ran into error");
        throw err;
      } 
      console.log(req.body);
      var query = util.format("DELETE FROM Posts WHERE end_date < %d;", new Date().getTime); // Should store dates using PostgreSQL date type and convert JS date to right format.
      console.log(query);
      client.query(query);
    });
  });
}


// Set interval for deleting old posts




var port_number = process.env.PORT || 8081;
var server = app.listen(port_number, function () {
  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)
  console.log(util.format("date is %s", new Date()));
  console.log("Database is at:");
  console.log(process.env.DATABASE_URL);
})