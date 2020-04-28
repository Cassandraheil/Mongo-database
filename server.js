var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");


var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");
var PORT = 3000;
var app = express();

app.use(logger("dev"));
app.use(express.urlencoded({extended: true }));
app.use(express.json());
app.use(express.static("public"));

var MONGODB_URI = process.env.MONGODB_URI || "https://evening-lake-25520.herokuapp.com/";

mongoose.connect(MONGODB_URI);

app.get("/scrape", function(req, res){
    axios.get("https://www.buzzfeed.com/")
    .then(function(response){
        var $ = cheerio.load(response.data);
        
        $("article h2").each(function(i, element){
            var result ={};

            //finding the title and link
            result.title = $(element)
                .children("a")
                .text();
            result.link = $(element)
                .children("a")
                .attr("href");
            // result.summary = $(element)
            //     .siblings("p")
            //     .text();
            
            db.Article.create(result)
            .then(function(dbArticle){
                console.log("this is dbArticle", dbArticle);
            }).catch(function(err){
                console.log(err);
            });
        });
        //making the new article to send to page
    });
    res.send("Scrape successful")
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
        res.json(dbArticle);
    }).catch(function(err){
        res.json(err);
    });
});

app.get("/saved", function(req, res){
    db.Article.find().sort({saved: true})
    .then(function(dbArticle){
        //sending them to 'database'
        res.json(dbArticle);
    }).catch(function(err){
        res.json(err);
    });
});

app.post("/saved/:id", function(req, res){
    console.log("request", req.body)

    db.Article.create(req.body)
    .then(function(dbArticle) {

      return db.Article.dbArticle._id.findOneAndUpdate( 
          {}, {$push: { saved: true }}, {new:true});
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