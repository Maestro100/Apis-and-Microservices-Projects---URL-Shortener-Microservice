var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var mongoose = require('mongoose');
var shortUrl = require('./models/shortUrl');

var app = express();
app.use(bodyParser.json());
app.use(cors());

mongoose.connect('mongodb://localhost/shortUrls');


app.use(express.static(__dirname+'/public'));

app.get('/new/:urlToShorten(*)',(req,res,next)=>{
    var urlToShorten = req.params.urlToShorten;
    
    var regex =/[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
    if(regex.test(urlToShorten)===true){
        var short = Math.floor(Math.random()*100000).toString();
        var data = new shortUrl(
            {
                originalUrl: urlToShorten,
                shorterUrl: short
            }
        );
        data.save(err=>{
            if(err) return res.send("Error saving in database");

        });
        return res.json(data);
    }
    else{
        var data = new shortUrl({
            originalUrl: urlToShorten,
            shorterUrl: 'InvalidURL'
        });
        return res.json(data);
    }
});


app.get('/:urlToForward',(req,res,next)=>{
    var shorterUrl = req.params.urlToForward;
    
    shortUrl.findOne({'shorterUrl':shorterUrl}, (err,data)=>{
        if(err) return res.send('Error reading database');
        var re = new RegExp("^(http|https)://","i");
        var strToCheck = data.originalUrl;
        if(re.test(strToCheck)){
            res.redirect(301,data.originalUrl);
        }
        else{
            res.redirect(301,'http://'+data.originalUrl);
        }
    });
});


app.listen(3000,function(){
    console.log("Server started");
});
