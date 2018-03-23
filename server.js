// server.js
// where your node app starts

// init project
const express = require('express')
const app = express()
var mongo = require('mongodb')
var MongoClient = mongo.MongoClient

var dburl = 'mongodb://'+process.env.DB_USER+':'+process.env.DB_PASS+'@ds046677.mlab.com:46677/fcc-shortener';

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'))

app.get("/new/:protocol://:url", (request, response) => {
  var url = request.params.protocol + '://' + request.params.url;
  var result = {
    'original_url': url,
    'short_url': ""
  };
  
  MongoClient.connect(dburl, function(err, db) {
    if (err) {
      result.short_url = "error";
      response.json(result);
      return;
    }
    
    var collection = db.collection('shorturl');
    collection.find({"original_url": url},{"_id":1}).toArray((err,data)=>{
      if (err) {
        result.short_url = "error";
        response.json(result);
        return;
      }
      if (data.length > 0) {
        result.short_url = 'https://adorable-thought.glitch.me/' + data[0]._id;
        db.close();
        response.json(result);
      }
      else {
        result.short_url = 'https://adorable-thought.glitch.me/1';
        collection.insert({"original_url": url}, (err,doc)=>{
          if (err) {
            result.short_url = "error";
            response.json(result);
            return;
          }
          console.log(doc);
          result.short_url = 'https://adorable-thought.glitch.me/' + doc.ops[0]._id;
          db.close();
          response.json(result);
        });
      }
    });
  })
})

app.get('/new/*', (req,res)=>{
  res.json({
    'original_url': "error",
    'short_url': "error"
  });
});

app.get('/:id',(req,res)=>{
  MongoClient.connect(dburl, function(err, db) {
    if (err) {
      console.log("Error", err);
      return;
    }
    
    var id = mongo.ObjectId(req.params.id);
    var collection = db.collection('shorturl');
    console.log("Request",id);
    collection.find({"_id": id},{"original_url":1}).toArray((err,data)=>{
      if (err) {
        console.log("Error",err);
        return;
      }

      console.log(data);
      console.log("Trace 1",data.length);
      if (data.length > 0) {
        console.log("Trace 2");
        res.writeHead(301, {Location: data[0].original_url});
        console.log("Trace 3");
      }
      
      res.end();
      console.log("Trace 4");
      db.close();
    });
  });
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`)
})
