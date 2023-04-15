var apiKey = "f8c008ebc30e5059d679aa6a57e4b627";
var qParam = "Minneapolis";

var final_data;

function getCityForecast(queryParam) {
  var url = new URL("http://api.openweathermap.org/geo/1.0/direct")
  url.searchParams.set("q", queryParam);
  url.searchParams.set("appid", apiKey);
  
  fetch(url.href)
  .then(function(response){
    console.log(response);
    return response.json();
  })
  .then(function(data){
    console.log(data);
    getForcast({lat: data[0]["lat"], lon: data[0]["lon"]});
  })
}

function getForcast(coord) {
  var url2 = new URL("http://api.openweathermap.org/data/2.5/forecast")
  url2.searchParams.set("lat", coord["lat"]);
  url2.searchParams.set("lon", coord["lon"]);
  url2.searchParams.set("units", "imperial");
  url2.searchParams.set("appid", apiKey);
  
  fetch(url2.href)
  .then(function(response){
    console.log(response);
    return response.json();
  })
  .then(function(data){
    console.log(data);
    processForecast(data["list"]);
  })
}

function processForecast(raw_data) {
  results = {};
  for(i=0;i<raw_data.length;i++){
    var data_date = dayjs.unix(raw_data[i]["dt"]).format("YYYYMMDD");

    var raw_temp = raw_data[i]["main"]["temp"];
    var raw_wind = raw_data[i]["wind"]["speed"];
    var raw_humidity = raw_data[i]["main"]["humidity"];

    if (results[data_date]) {
      var prev_temp = results[data_date]["temp"];
      var prev_wind = results[data_date]["wind"];
      var prev_humidity = results[data_date]["humidity"];

      results[data_date]["temp"] = prev_temp < raw_temp ? raw_temp : prev_temp;
      results[data_date]["wind"] = prev_wind < raw_wind ? raw_wind : prev_wind;
      results[data_date]["humidity"] = prev_humidity < raw_humidity ? raw_humidity : prev_humidity;
    } else {
    var raw_date = dayjs.unix(raw_data[i]["dt"]).format("MM/DD/YYYY");
    results[data_date] = {"date":raw_date, "temp":raw_temp, "wind":raw_wind, "humidity": raw_humidity};
    }
  }
  console.log(results);
  final_data = results;
}

getCityForecast(qParam);
