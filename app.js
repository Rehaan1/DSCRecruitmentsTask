require('dotenv').config();
const express = require('express') ;//acquiring express
const passport = require('passport'); //passport helps in authentication using given strategies
const https = require("https"); //native https of node
const http = require("http"); //native https of node
const cookieSession = require('cookie-session');
const mysql = require('mysql');
require('./passport-setup');


//establishing connection details
var con = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"dsc_recruitment",
});

//establishing connection to database
con.connect(function(err)
{
  if(err)
  {
    console.log(err);
  }
  else
  {
  console.log("Connected!");
  }
});

const app = express();

app.use(cookieSession({
    name: 'dscrecruitmenttask',
    keys: ['key1', 'key2']
  }));

app.set('view engine','ejs'); //setting a view ejs

// Auth middleware that checks if the user is logged in
const isLoggedIn = (req, res, next) => {
    if (req.user) {
        next();
    } else {
        res.sendStatus(401);
    }
}

// Initializes passport and passport sessions
app.use(passport.initialize());
app.use(passport.session());


app.get('/', function(req, res){

   res.render('pages/index');
 });

app.get('/failed', function(req, res){
  res.send('You Failed to log in!')
});

// Route taken if user logged in
app.get('/success', isLoggedIn, function(req, res)
{

    var d = new Date();
    var date = String(d.getDate())+"-"+String(d.getMonth()+1)+'-'+String(d.getFullYear());
    console.log(date);
    var url ="http://ip-api.com/json/"; //url for location api
    http.get(url, function(response) //doing https get request
    {
                console.log("LOCATION API CODE:" + response.statusCode);

                response.on("data", function(data) //gets "data" and sends to callback function
                {
                            const locationData = JSON.parse(data); //parsing to JSON format
                            const query = locationData.city;
                            console.log(query);
                            const apikey = "3689aba48c824795bb2b0d16955e7821";
                            const units = "metric";
                            const url = "https://api.openweathermap.org/data/2.5/weather?q="+query+"&appid="+apikey+"&units="+units;

                            https.get(url, function(response) //doing https get request to openweathermap
                            {
                                        console.log("WEATHER API CODE:" + response.statusCode);

                                        response.on("data", function(data) //gets "data" and sends to callback function
                                        {
                                                    const weatherData = JSON.parse(data); //parsing to JSON format
                                                    const  temp = weatherData.main.temp; //going to path temp inside main inside JSON object
                                                    const description = weatherData.weather[0].description;
                                                    const icon = weatherData.weather[0].icon;
                                                    const humidity = weatherData.main.humidity;
                                                    const windspeed = weatherData.wind.speed;
                                                    const imageURL = "http://openweathermap.org/img/wn/"+icon+"@2x.png";

                                                    //querying database
                                                    con.query("SELECT * FROM weather_data WHERE Date=?",[date],function(error,rows,fields)
                                                    {
                                                                   if(error)
                                                                   {
                                                                       console.log("Error2");
                                                                   }

                                                                   else
                                                                   {
                                                                               console.log("Successful");
                                                                               console.log(rows.length);
                                                                               if(rows.length == 0)
                                                                               {
                                                                                  con.query("INSERT INTO weather_data (Date,Temp,Description,Humidity,Windspeed) values(?,?,?,?,?)",[date,String(temp),String(description),String(humidity),String(windspeed)],function(error,rows,fields)
                                                                                  {
                                                                                      if(error)
                                                                                      {
                                                                                        console.log("Error3");
                                                                                      }
                                                                                      else{
                                                                                        console.log("Entered New Data");
                                                                                      }
                                                                                  });
                                                                              }
                                                                              else
                                                                              {
                                                                                  con.query("UPDATE weather_data SET Temp=?, Description=?, Humidity=?, Windspeed=? WHERE Date=?",[String(temp),String(description),String(humidity),String(windspeed),String(date)],function(error,rows,fields)
                                                                                  {
                                                                                     if(error)
                                                                                     {
                                                                                       console.log("Error4");

                                                                                     }
                                                                                     else
                                                                                     {
                                                                                       console.log("Updated")
                                                                                     }
                                                                                  });
                                                                              }
                                                                        }




                                      });
                                      res.render("pages/weather-auth",{place:query,pic:imageURL,temp:temp,name:req.user.displayName,weatherdescription:description,humidity:humidity,windspeed:windspeed});
                        });

              });
    });
  });
});


app.get('/history',function(req,res)
{
    con.query("SELECT * FROM weather_data",function(error,rows,fields)
    {
      if(error)
      {
          console.log("Error2");
      }

      else
      {
          console.log(rows);
          res.render("pages/history",{rows});
      }
    });

});

app.get('/guest', function(req,res)
{
    var url ="http://ip-api.com/json/"; //url for location api
    http.get(url, function(response) //doing https get request
    {
        console.log("LOCATION API CODE:" + response.statusCode);

        response.on("data", function(data) //gets "data" and sends to callback function
        {
            const locationData = JSON.parse(data); //parsing to JSON format
            const query = locationData.city;
            console.log(query);
            const apikey = "3689aba48c824795bb2b0d16955e7821";
            const units = "metric";
            const url = "https://api.openweathermap.org/data/2.5/weather?q="+query+"&appid="+apikey+"&units="+units;

            https.get(url, function(response) //doing https get request to openweathermap
            {
                console.log("WEATHER API CODE:" + response.statusCode);

                response.on("data", function(data) //gets "data" and sends to callback function
                {
                    const weatherData = JSON.parse(data); //parsing to JSON format
                    const temp = weatherData.main.temp; //going to path temp inside main inside JSON object

                    res.render("pages/weather-guest",{place:query,temp:temp});
                  });

              });
        });

      });

});

// Auth Routes
app.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/google/callback', passport.authenticate('google', { failureRedirect: '/failed' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/success');
  }
);

app.get('/logout', function(req, res){
    req.session = null;
    req.logout();
    res.redirect('/');
});


app.listen(5000, function(){
  console.log(`Example app listening on port 5000`)});
