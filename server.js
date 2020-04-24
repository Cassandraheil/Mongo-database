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

mongoose.connect("mongodb://localhost/unit18Populater", {useNewUrlParser: true});

app.get("/scrape", function(req, res){
    axios.get("https://www.ehow.com/")
    .then(function(response){
        var $ = cheerio.load(response.data);

        $("h2.title").each(function(i, element){
            var result ={};

            //finding the title and link
            result.title = $(this)
                .children("a")
                .text();
            result.link = $(this)
                .children("a")
                .attr("href");
            
            //making the new article to send to page
            db.Article.create(result)
            .then(function(dbArticle){
                console.log("this is dbArticle", dbArticle);
            }).catch(function(err){
                console.log(err);
            });
    });
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

app.post("articles/:id", function(req, res){
    db.Note.create(req.body)
    .then(function(dbNote){

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






app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });