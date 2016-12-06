var express = require('express');
var app = express();
require('es6-promise').polyfill();
var pg = require('pg');
var bodyParser = require('body-parser');
const util = require('util');
var db_url = process.env.DATABASE_URL;
var cors = require('cors');
app.use(cors({credentials: true, origin: true}));

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


// *************************************************************
// POST Requests

// POST a new user

// POST a new post

// POST a duplicate report




// *************************************************************
// GET Requests

// GET all locations
app.get('/locations', function(req, res) {
  response = [];
  pg.connect(db_url, function(err, client) {
    if (err) {
      console.log("Ran into error");
      throw err;
    } 
    var query = 'SELECT name, x, y FROM Location;';

    client.query(query).on('row', function(row){
      response.push(row);
      console.log("location:")
      console.log(JSON.stringify(row));
    }).on("end", function() {
      console.log("LOCATIONS QUERY FINISHED *************");
      res.end(JSON.stringify(response));
    });
  });
})

// GET all tags
app.get('/tags', function(req, res) {
  response = [];
  pg.connect(db_url, function(err, client) {
    if (err) {
      console.log("Ran into error");
      throw err;
    } 
    var query = 'SELECT * FROM tags ORDER BY title ASC;';

    client.query(query).on('row', function(row){
      response.push(row);
      console.log("tag:")
      console.log(JSON.stringify(row));
    }).on("end", function() {
      console.log("TAGS QUERY FINISHED *************");
      res.end(JSON.stringify(response));
    });
  });
})

// GET validation for a log in
app.get('/login', function(req, res) {
  response = [];
  pg.connect(db_url, function(err, client) {
    if (err) {
      console.log("Ran into error");
      throw err;
    } 
    var i = 0;
    console.log(req.query);
    console.log("******************");

    var query = util.format('SELECT password ' +
      'FROM Users ' + 
      "WHERE username = '%s';", 
      req.query.username);
    console.log(query);

    client.query(query).on('row', function(row){
      response.push(row);
      console.log("password:")
      console.log(JSON.stringify(row));
    }).on("end", function() {
      if (response.length < 1) {
        res.end("fail");
      } else if (response[0].password == req.query.password) {
        res.end("pass");
      } else {
        res.end("fail");
      }
      console.log("LOGIN QUERY FINISHED *************");
    });
  });
})

// GET all posts by username
app.get('/posts/username', function(req, res) {
  response = [];
  pg.connect(db_url, function(err, client) {
    if (err) {
      console.log("Ran into error");
      throw err;
    } 
    var i = 0;
    console.log(req.query);
    console.log("******************");

    var query = util.format('SELECT title, body, start_time, end_time, tag_1, tag_2, tag_3, Location.name AS loc ' +
      'FROM (Post INNER JOIN Location ON Post.location_id = Location.id) INNER JOIN Users ON Post.user_id = Users.id ' + 
      "WHERE Users.name = '%s';", 
      req.query.username);
    console.log(query);

    client.query(query).on('row', function(row){
      row.tag_1 = formatTag(row.tag_1);
      row.tag_2 = formatTag(row.tag_2);
      row.tag_3 = formatTag(row.tag_3);
      row.start_time = formatDate(row.start_time);
      row.end_time = formatDate(row.end_time);
      response.push(row);
      console.log("Content of Posts:")
      console.log(JSON.stringify(row));
    }).on("end", function() {
      console.log("USERNAME QUERY FINISHED *************");
      res.end(JSON.stringify(response));
    });
  });
})


// GET posts, filtered by tag
app.get('/posts/tags', function(req, res) {
  response = [];
  pg.connect(db_url, function(err, client) {
    if (err) {
      console.log("Ran into error");
      throw err;
    } 
    var i = 0;
    console.log(req.query);
    console.log("******************");
    var query;
    if (req.query.tag == "" || req.query.tag == undefined || req.query.tag == null) {
      var query = 'SELECT title, body, start_time, end_time, Users.username AS poster, tag_1, tag_2, tag_3, Location.name AS loc ' +
      'FROM (Post INNER JOIN Location ON Post.location_id = Location.id) INNER JOIN Users on Post.user_id = Users.id;';
    } else {
      var query = util.format('SELECT title, body, start_time, end_time, Users.username AS poster, tag_1, tag_2, tag_3, Location.name AS loc ' +
        'FROM (Post INNER JOIN Location ON Post.location_id = Location.id) INNER JOIN Users ON Post.user_id = Users.id ' + 
        "WHERE tag_1 = '%s' OR tag_2 = '%s' OR tag_3 = '%s';", 
        req.query.tag,
        req.query.tag,
        req.query.tag);
    }
    console.log(query);

    client.query(query).on('row', function(row){
      row.tag_1 = formatTag(row.tag_1);
      row.tag_2 = formatTag(row.tag_2);
      row.tag_3 = formatTag(row.tag_3);
      row.start_time = formatDate(row.start_time);
      row.end_time = formatDate(row.end_time);
      response.push(row);
      console.log("Content of Posts:")
      console.log(JSON.stringify(row));
    }).on("end", function() {
      console.log("TAG QUERY FINISHED ************");
      res.end(JSON.stringify(response));
    });
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

    var query = util.format('SELECT title, body, start_time, end_time, Users.username AS poster, tag_1, tag_2, tag_3 ' +
      'FROM (Post INNER JOIN Location ON Post.location_id = Location.id) INNER JOIN Users ON Post.user_id = Users.id ' + 
      "WHERE Location.name = '%s';", 
      req.query.location);
    console.log(query);

    client.query(query).on('row', function(row){
      row.tag_1 = formatTag(row.tag_1);
      row.tag_2 = formatTag(row.tag_2);
      row.tag_3 = formatTag(row.tag_3);
      row.start_time = formatDate(row.start_time);
      row.end_time = formatDate(row.end_time);
      response.push(row);
      console.log("Content of Posts:")
      console.log(JSON.stringify(row));
    }).on("end", function() {
      console.log("LOCATION QUERY FINISHED *************");
      res.end(JSON.stringify(response));
    });
  });
})

function formatTag (tag) {
  if (tag == null) {
    return '';
  }
  return tag;
}

function formatDate (timestamp) {
  var date = "" + timestamp;
  console.log(date);
  console.log("*************************");
  var formatted = date.substring(0, 16);
  var time = date.substring(16, 21);
  var hour = parseInt(time.substring(0,2));
  var hour_formatted = (hour % 12) ? (hour % 12) : 12;
  formatted = formatted + hour_formatted + time.substring(2);
  if (hour >= 12) {
    formatted = formatted + ' PM';
  } else {
    formatted = formatted + ' AM';
  }
  return formatted;
}



// DELETE posts if the end date is less than the current date
var deleteOldPosts = function() {
  console.log("deleting");
  pg.connect(db_url, function(err, client) {
    if (err) {
      console.log("Ran into error");
      throw err;
    } 
    console.log(req.body);
    var query = "DELETE FROM Posts WHERE (end_date - interval '5 hours' < now();";
    console.log(query);
    client.query(query);
  });
}


// Set interval for deleting old posts
setInterval(function() {
  deleteOldPosts();
}, 5000);



var port_number = process.env.PORT || 8081;
var server = app.listen(port_number, function () {
  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)
  console.log(util.format("date is %s", new Date()));
  console.log("Database is at:");
  console.log(process.env.DATABASE_URL);
})