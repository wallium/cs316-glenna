var express = require('express');
var app = express();
require('es6-promise').polyfill();
var pg = require('pg');
var bodyParser = require('body-parser');
const util = require('util');
var db_url = process.env.DATABASE_URL;
var cors = require('cors');
var mysql = require('mysql');
app.use(cors({credentials: true, origin: true}));

// Create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

pg.defaults.ssl = true;

app.get('/', function (req, res) {
  res.send('Hello World');
})


// *************************************************************
// POST Requests

// POST a new user
var userid = 10;
pg.connect(db_url, function(err, client, done) {
  if (err) {
    console.log("Ran into error");
    throw err;
  } 
  var query = 'SELECT MAX(id) FROM Users;';

  client.query(query).on('row', function(row){
    console.log(JSON.stringify(row));
    userid = row.max + 1;
  }).on("end", function() {
    console.log("MAX USERID FOUND*************");
    console.log("Next userid:");
    console.log(userid);
    done();
  });
});

app.post('/new_user', urlencodedParser, function (req, res) {
  pg.connect(db_url, function(err, client, done) {
    if (err) {
      console.log("Ran into error");
      throw err;
    }
    console.log("**************");
    console.log(req.body);
    var checkNameQuery = util.format("SELECT * FROM Users WHERE username = '%s'", mysql.escape(req.body.username));
    var nameExists = false;
    client.query(checkNameQuery).on('row', function(row){
      nameExists = true;
      console.log("match:")
      console.log(JSON.stringify(row));
    }).on("end", function() {
      if (nameExists) {
        res.status(516).send();
        done();
      } else {
        var query = util.format("INSERT INTO Users VALUES (%d, '%s', '%s');", userid, mysql.escape(req.body.username), mysql.escape(req.body.password));
        userid = userid+1;
        console.log(query);
        client.query(query).on("end", function() {
          res.status(200).send()
          done();
        });
      }
    });
  });
})


// POST a new post
var postid = 10;
pg.connect(db_url, function(err, client, done) {
  if (err) {
    console.log("Ran into error");
    throw err;
  } 
  var query = 'SELECT MAX(id) FROM Post;';

  client.query(query).on('row', function(row){
    console.log(JSON.stringify(row));
    postid = row.max + 1;
  }).on("end", function() {
    console.log("MAX POSTID FOUND*************");
    console.log("Next postid:");
    console.log(postid);
    done();
  });
});

app.post('/new_post', urlencodedParser, function (req, res) {
  pg.connect(db_url, function(err, client, done) {
    if (err) {
      console.log("Ran into error");
      throw err;
    }
    console.log(req);
    console.log("**************");
    console.log(req.body);

    var user_id = 0;
    var usernameQuery = util.format("SELECT id FROM Users WHERE username = '%s';", mysql.escape(req.body.username));
    var location_id = 0;
    var locationQuery = util.format("SELECT id FROM Location WHERE name = '%s';", mysql.escape(req.body.location));

    var start_time = req.body.start_time.substring(0, 19);
    var end_time = req.body.end_time.substring(0, 19);

    client.query(usernameQuery).on('row', function(row){
      user_id = row.id;
    }).on("end", function() {
      client.query(locationQuery).on('row', function(row){
          location_id = row.id;
      }).on("end", function() {
          var query = util.format("INSERT INTO Post VALUES (%d, %d, '%s', '%s', '%s', '%s', now(), %d, 0, %s, %s, %s);", postid, location_id, req.body.title, req.body.description, start_time, end_time, user_id, nullify(req.body.tag1), nullify(mysql.escape(req.body.tag2)), nullify(mysql.escape(req.body.tag3)));
          postid = postid + 1;
          client.query(query).on('end', function() {
            res.end();
            done();
          })
      });  
    });    
  });
})

function nullify(tag) {
  if (tag == ''){
    return "NULL";
  }
  return "'" + tag + "'";
}

// POST a duplicate report
app.post('/report', urlencodedParser, function (req, res) {
  pg.connect(db_url, function(err, client, done) {
    if (err) {
      console.log("Ran into error");
      throw err;
    }
    console.log("**************");
    console.log(req.body);

    req.body.post_id = parseInt(req.body.post_id);
    var reportsQuery = util.format("SELECT reports FROM Post WHERE id = %d;", req.body.post_id);
    var prev_reports = -1;
    client.query(reportsQuery).on('row', function(row){
      prev_reports = row.reports;
    }).on('end', function() {
      if (prev_reports > -1) {
        var query = util.format("UPDATE Post SET (reports) = (%d) WHERE id = %d;", prev_reports + 1, mysql.escape(req.body.post_id));
        client.query(query).on('end', function() {
          done();
          res.end();
        });
      } else {
        res.end();
        done();
      }
      console.log("REPORT QUERY FINISHED*********");
    });  
  });
})

// POST a delete post
app.post('/delete', urlencodedParser, function (req, res) {
  pg.connect(db_url, function(err, client, done) {
    if (err) {
      console.log("Ran into error");
      throw err;
    }
    console.log("**************");
    console.log(req.body);

    req.body.post_id = parseInt(req.body.post_id);
    var query = util.format("DELETE FROM Post WHERE id = %d;", mysql.escape(req.body.post_id));
    client.query(query).on('end', function() {
      console.log("DELETE QUERY FINISHED*********");
      res.end();
      done();
    });
  });
})


// *************************************************************
// GET Requests

// GET all locations
app.get('/locations', function(req, res) {
  response = [];
  pg.connect(db_url, function(err, client, done) {
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
      done();
    });
  });
})

// GET all tags
app.get('/tags', function(req, res) {
  response = [];
  pg.connect(db_url, function(err, client, done) {
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
      done();
    });
  });
})

// GET validation for a log in
app.get('/login', function(req, res) {
  response = [];
  pg.connect(db_url, function(err, client, done) {
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
      mysql.escape(req.query.username));
    console.log(query);

    client.query(query).on('row', function(row){
      response.push(row);
      console.log("password:")
      console.log(JSON.stringify(row));
    }).on("end", function() {
      if (response.length < 1) {
        res.status(516).send("fail");
        console.log("This user doesn't exist");
      } else if (response[0].password == req.query.password) {
        res.status(200).send("pass");
        console.log("This login passed");
      } else {
        res.status(516).send("fail");
        console.log("The password is incorrect");
      }
      console.log("LOGIN QUERY FINISHED *************");
      done();
    });
  });
})

// GET all posts by username
app.get('/posts/username', function(req, res) {
  response = [];
  pg.connect(db_url, function(err, client, done) {
    if (err) {
      console.log("Ran into error");
      throw err;
    } 
    var i = 0;
    console.log(req.query);
    console.log("******************");

    var query = util.format("SELECT Post.id AS id, title, body, (start_time - interval '5 hours') AS start_time, (end_time - interval '5 hours') AS end_time, Users.username AS poster, tag_1, tag_2, tag_3, Location.name AS location " +
      'FROM (Post INNER JOIN Location ON Post.location_id = Location.id) INNER JOIN Users ON Post.user_id = Users.id ' + 
      "WHERE Users.username = '%s' ORDER BY start_time ASC;", 
      mysql.escape(req.query.username));
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
      done();
    });
  });
})


// GET posts, filtered by tag
app.get('/posts/tags', function(req, res) {
  response = [];
  pg.connect(db_url, function(err, client, done) {
    if (err) {
      console.log("Ran into error");
      throw err;
    } 
    console.log(req.query);
    console.log("******************");
    var query;
    if (req.query.tag == "" || req.query.tag == undefined || req.query.tag == null) {
      var query = "SELECT Post.id AS id, title, body, (start_time - interval '5 hours') AS start_time, (end_time - interval '5 hours') AS end_time, Users.username AS poster, tag_1, tag_2, tag_3, Location.name AS location " +
      'FROM (Post INNER JOIN Location ON Post.location_id = Location.id) INNER JOIN Users on Post.user_id = Users.id ORDER BY start_time ASC;';
    } else {
      var query = util.format("SELECT Post.id AS id, title, body, (start_time - interval '5 hours') AS start_time, (end_time - interval '5 hours') AS end_time, Users.username AS poster, tag_1, tag_2, tag_3, Location.name AS location " +
        'FROM (Post INNER JOIN Location ON Post.location_id = Location.id) INNER JOIN Users ON Post.user_id = Users.id ' + 
        "WHERE tag_1 = '%s' OR tag_2 = '%s' OR tag_3 = '%s' ORDER BY start_time ASC;", 
        mysql.escape(req.query.tag),
        mysql.escape(req.query.tag),
        mysql.escape(req.query.tag));
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
      done();
    });
  });
})

// GET posts, filtered by location
app.get('/posts', function(req, res) {
  response = [];
  pg.connect(db_url, function(err, client, done) {
    if (err) {
      console.log("Ran into error");
      throw err;
    } 
    var i = 0;
    console.log(req.query);
    console.log("******************");

    var query = util.format("SELECT Post.id AS id, title, body, (start_time - interval '5 hours') AS start_time, (end_time - interval '5 hours') AS end_time, Users.username AS poster, tag_1, tag_2, tag_3 " +
      'FROM (Post INNER JOIN Location ON Post.location_id = Location.id) INNER JOIN Users ON Post.user_id = Users.id ' + 
      "WHERE Location.name = '%s' ORDER BY start_time ASC;", 
      mysql.escape(req.query.location));
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
      done();
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
function deleteOldPosts() {
  console.log("deleting");
  pg.connect(db_url, function(err, client, done) {
    if (err) {
      console.log("Ran into error");
      throw err;
    } 
    var query = "DELETE FROM Post WHERE end_time < now();";
    console.log(query);
    client.query(query).on("end", function() {
      done();
    });
  });
}


// Set interval for deleting old posts
// setInterval(deleteOldPosts, 6*1800000); // 6*30 minutes
setInterval(deleteOldPosts, 60000);



var port_number = process.env.PORT || 8081;
var server = app.listen(port_number, function () {
  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)
  console.log(util.format("date is %s", new Date()));
  console.log("Database is at:");
  console.log(process.env.DATABASE_URL);
})