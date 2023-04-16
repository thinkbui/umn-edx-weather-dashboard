var apiKey = "f8c008ebc30e5059d679aa6a57e4b627";
var search_history = document.getElementsByClassName("search_history")[0].getElementsByTagName("ul")[0];
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
    addSearchHistory(queryParam);
    if(data.length > 0){
      setCityName(data[0]["name"], data[0]["state"]);
      getForcast({lat: data[0]["lat"], lon: data[0]["lon"]});
    } else {
      alert("No city by that name could be found.");
    }
  })
}

function addSearchHistory(queryParam) {
  var aElem = document.createElement("a");
  aElem.setAttribute("href", "#");
  aElem.setAttribute("onclick", `getCityForecast("${queryParam}")`);
  aElem.textContent = queryParam;

  var liElem = document.createElement("li");
  liElem.prepend(aElem);

  search_history.prepend(liElem);
}

function setCityName(city_name, state_name) {
  var cityNameElem = document.getElementById("city_name");
  var cName = city_name;
  if (state_name) {
    cName += `, ${state_name}`;
  }
  cityNameElem.textContent = cName;
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

    var raw_icon = parseIconCode(raw_data[i]["weather"][0]["icon"]);
    var raw_temp = raw_data[i]["main"]["temp"];
    var raw_wind = raw_data[i]["wind"]["speed"];
    var raw_humidity = raw_data[i]["main"]["humidity"];

    if (results[data_date]) {
      results[data_date]["icon"] = Math.max(results[data_date]["icon"], raw_icon);
      results[data_date]["temp"] = Math.max(results[data_date]["temp"], raw_temp);
      results[data_date]["wind"] = Math.max(results[data_date]["wind"], raw_wind);
      results[data_date]["humidity"] = Math.max(results[data_date]["humidity"], raw_humidity);
    } else {
    var raw_date = dayjs.unix(raw_data[i]["dt"]).format("MM/DD/YYYY");
    results[data_date] = {"date":raw_date, "icon":raw_icon, "temp":raw_temp, "wind":raw_wind, "humidity": raw_humidity};
    }
  }
  console.log(results);
  final_data = results;
  displayForecast(results);
}

function parseIconCode(code) {
  return parseInt(code);
}

function displayForecast(forecast_data) {
  var data_dates = Object.keys(forecast_data).sort();
  var data_date_today = data_dates.shift();
  displayToday(data_date_today, forecast_data)
  displayDays(data_dates, forecast_data)
}

function displayToday(date, forecast_data) {
  var bfElem = document.getElementById("bf");
  displayData(bfElem, forecast_data[date], true);
  console.log(forecast_data[date]);
}

function displayDays(dates, forecast_data) {
  for(i=0;i<dates.length;i++){
    console.log(forecast_data[dates[i]]);
    var sfElem = document.getElementById(`sf${i+1}`);
    displayData(sfElem, forecast_data[dates[i]], false);
  }
  setDay5Visibility(dates.length)
}

function displayData(elem, data, bigIcon) {
  var dateElem = elem.getElementsByClassName("date_val")[0];
  dateElem.textContent = data["date"];

  var iconElem = elem.getElementsByTagName("img")[0];
  iconElem.src = bigIcon ? iconBigSrc(data["icon"]) : iconSrc(data["icon"]);

  var tempElem = elem.getElementsByClassName("temp_val")[0];
  tempElem.textContent = Math.round(data["temp"]);

  var windElem = elem.getElementsByClassName("wind_val")[0];
  windElem.textContent = Math.round(data["wind"]);

  var humidityElem = elem.getElementsByClassName("humidity_val")[0];
  humidityElem.textContent = Math.round(data["humidity"]);
}

function iconSrc(code) {
  return `https://openweathermap.org/img/wn/${iconCodePad(code)}d.png`
}

function iconBigSrc(code) {
  return `https://openweathermap.org/img/wn/${iconCodePad(code)}d@2x.png`
}

function iconCodePad(code) {
  return code.toString().padStart(2,'0');
}

function setDay5Visibility(forecast_length) {
  var sf5Elem = document.getElementById("sf5");
  var visibility = "hidden";
  if(forecast_length == 5) {
    visibility = "visible";
  }
  sf5Elem.setAttribute("style", `visibility:${visibility}`);
}

document.getElementById("search_btn").addEventListener("click", function(event){
  event.preventDefault();
  var search_text = document.getElementById("search_input").value;
  clearForm();
  getCityForecast(search_text);
})

function clearForm() {
  document.getElementById("search_input").value = "";
}

getCityForecast(qParam);
