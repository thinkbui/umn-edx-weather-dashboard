var apiKey = "f8c008ebc30e5059d679aa6a57e4b627";

function getCityForecast() {
  var qParam = "Minneapolis";
  var url = new URL("http://api.openweathermap.org/geo/1.0/direct")
  url.searchParams.set("q", qParam);
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
    var data_date = dayjs.unix(raw_data[i]["dt"]).format("MM/DD/YYYY");
    if (results[data_date]) {
      if ( results[data_date]["temp"] < raw_data[i]["main"]["temp"] ) {
        results[data_date]["temp"] = raw_data[i]["main"]["temp"];
      }
      if ( results[data_date]["wind"] < raw_data[i]["wind"]["speed"] ){
        results[data_date]["wind"] = raw_data[i]["wind"]["speed"];
      }
      if ( results[data_date]["humidity"] < raw_data[i]["main"]["humidity"] ){
        results[data_date]["humidity"] = raw_data[i]["main"]["humidity"];
      }
    } else {
      results[data_date] = {};
      results[data_date]["temp"] = raw_data[i]["main"]["temp"];
      results[data_date]["wind"] = raw_data[i]["wind"]["speed"];
      results[data_date]["humidity"] = raw_data[i]["main"]["humidity"];
    }
  }
  console.log(results);
}

getCityForecast();
