var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var handlebars = require("handlebars")
// var path = require("path");

var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");
var PORT = 3000;
var app = express();

app.use(logger("dev"));
app.use(express.urlencoded({extended: true }));
app.use(express.json());
app.use(express.static("public"));

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI);

app.get("/scrape", function(req, res){
    axios.get("https://www.buzzfeed.com/")
    .then(function(response){
        var $ = cheerio.load(response.data);

        $("atricle.h2").each(function(i, element){
            var result ={};

            //finding the title and link
            result.title = $(element)
                .children("a")
                .text();
            result.link = $(element)
                .children("a")
                .attr("href");
            result.summary = $(element)
            .sibling("p")
            .text();
            // result.pic = $(this)
            //     .children("picture")
            //     .source("data-srcset");
            // .find("a").find("img").attr("data-srcset").split(",")[0].split(" ")[0];
            
            db.Article.create(result)
            .then(function(dbArticle){
                console.log("this is dbArticle", dbArticle);
            }).catch(function(err){
                console.log(err);
            });
        });
        //making the new article to send to page
    res.send("Scrape successful")
    });
});


app.get("/articles",  function(req, res){
    //grabbing all articles
    db.Article.find({})
    .then(function(dbArticle){
        //sending them to 'database'
        res.json(dbArticle);
    }).catch(function(err){
        res.json(err);
    });
});

app.get("/articles/:id", function(req, res){
    db.Article.findOne({_id: req.params.id})
    .populate("note")
    .then(function(dbArticle){
        res.json(dbArticle);
    }).catch(function(err){
        res.json(err);
    });
});

app.post("/articles/:id", function(req, res){
    db.Note.create(req.body)
    .then(function(dbNote){
        console.log("dbnote", dbNote)

        return db.Article.findOneAndUpdate({
            _id: req.params.id}, 
        {
           note: dbNote._id
        },{
            new: true
        });
    }).then(function(dbArticle){
        console.log("db article", dbArticle)
        res.json(dbArticle);
    }).catch(function(err){
        res.json(err);
    });
});

app.get("/saved", function(req, res){
    res.sendfile(path)
});

app.post("/save/:id", function(req, res){
    console.log("request", req)

    db.Article.create(req.body)
    .then(function(dbArticle) {

      return db.Article.findOneAndUpdate( 
          {$push: {note: dbArticle._id}}, { saved: true });
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.get("/delete/:id", function(req, res){
    db.Article.remove(
        {
            _id: mongojs.ObjectID(req.params.id)
          },
          function(error, removed) {
            if (error) {
              console.log(error);
              res.send(error);
            }
            else {
              console.log(removed);
              res.send(removed);
            }
          }
    );
});






app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });