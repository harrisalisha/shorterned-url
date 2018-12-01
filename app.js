const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors')
const mongoose= require('mongoose');
const shortUrl = require('./models/shortUrl');

app.use(bodyParser.json());
app.use(cors());

//Connect to database, locally or process.env.MONGODB_URI(heroku maybe)
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/shortUrls', {useUrlParser: true});
//mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/shortUrls', {useUrlParser: true});


//allow node to find static content
app.use(express.static(__dirname + '/public'));

//create database entry
//* accept every thing, urlTOShorten is string
app.get('/new/:urlToShorten(*)', (req , res, next)=>{
    // es5 var urlToShorten = req.params.urlToShorten;
    var {urlToShorten} = req.params;
   // console.log(urlToShorten);

   //Regex for  url
   var expression = /[a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
   var regex = expression;
   if(regex.test(urlToShorten)){
       var short = Math.floor(Math.random()*100000).toString();

       var data = new shortUrl(
           {
               originalUrl : urlToShorten,
               shorterUrl : short
           }
       );
       
       data.save(err =>{
           if(err){
               return res.send('Error saving to database');
           }
       });

       return res.json({data})
   }
   var data =new shortUrl({
       originalUrl: 'urlToShorten does not macth',
       shorterUrl: 'Invalid Url'
   });
    return res.json({data});

});


app.get('/urlToFoward', (req, res,next)=>{
    var shorterUrl =req.params.UrlToFoward;
    //findOne(), shortUrl is mongoose obj
    shortUrl.findOne({'shorterUrl': shorterUrl}, (err, data)=>{
        if(err)
        return res.send('error reading database');
        var reg= new RegExp("^(http|https)://", "i");
        var strToCheck = data.originalUrl;
        if(reg.test(strToCheck)){
            res.redirect(301, data.originalUrl);
        }else{
            res.redirect(301, 'http://'+ data.originalUrl);
        }
    })
})

//es5 functio
//process.env.PORT in heroku
app.listen(process.env.PORT || 3000, ()=>{
 console.log('app is running ');

});