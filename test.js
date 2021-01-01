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
                                                    con.query("SELECT * FROM weather_data WHERE Date="+date,function(error,rows,fields)
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
                                                                                  con.query("INSERT INTO weather_data (Date,Temp,Description,Humidity,Windspeed) values("+date+","+String(temp)+","+String(description)","+String(humidity)+","+String(windspeed)+");",function(error,rows,fields)
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
                                                                                  con.query("UPDATE weather_data SET Temp="+String(temp)+", Description="+String(description)+", Humidity="+String(humidity)+", Windspeed="+String(windspeed)+" WHERE Date="+date,function(error,rows,fields)
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

                                                                        res.render("pages/weather-auth",{place:query,pic:imageURL,temp:temp,name:req.user.displayName,weatherdescription:description,humidity:humidity,windspeed:windspeed});

                                                  });

                                      });
                        });

              });
    });
});
